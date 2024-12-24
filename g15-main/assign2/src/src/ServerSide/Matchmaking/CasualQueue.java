package src.ServerSide.Matchmaking;

import src.ClientServer.Message;
import src.ServerSide.Game;
import src.ServerSide.User;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

public class CasualQueue extends MatchMaker {
    private final Queue<User> queue = new LinkedList<>();
    private final int roomSize;
    private boolean running = true;
    private final ExecutorService threadPool;
    private static final long DISCONNECT_TIMEOUT_MS = 30000;


    public CasualQueue(int roomSize, int poolSize) {
        this.roomSize = roomSize;
        this.threadPool = Executors.newFixedThreadPool(poolSize);
    }

    public int add(User client) {
        synchronized (queue) {
            long currentTime = System.currentTimeMillis();
            for (User u : queue) {
                if (u.equals(client)) {
                    if (!u.getToken().equals(client.getToken()) || (currentTime - u.getDisconnectTime()) > DISCONNECT_TIMEOUT_MS) {
                        System.out.println("Queue disconnect timeout");
                        queue.remove(u);
                        break;
                    }
                    u.clientHandler = client.clientHandler;
                    u.clientHandler.user = u;

                    System.out.println("User reconnected to the queue: " + client.getUsername());

                    queue.notifyAll();
                    u.setDisconnectTime(-1); // Reset disconnect time
                    return 0;
                }
            }

            queue.add(client);
            queue.notifyAll();
        }
        return 0;
    }

    public void run() {
        System.out.println("Starting casual queue");
        while (running) {
            List<User> group = formGroup();
            if (group != null && !group.isEmpty() && hasAvailableThreads()) {
                threadPool.execute(new Game(group));
            }
            removeDisconnectedUsers();
        }
        threadPool.shutdown();
    }

    public void stop() {
        synchronized (queue) {
            while (!queue.isEmpty()) {
                User user = queue.poll();
                if (user != null) {
                    user.sendMessage(new Message(Message.Context.LEAVEQUEUE, "You have left the queue.").toString());
                }
            }
            this.running = false;
            queue.notifyAll();
        }
    }

    private boolean hasAvailableThreads() {
        return ((ThreadPoolExecutor) threadPool).getActiveCount() < ((ThreadPoolExecutor) threadPool).getMaximumPoolSize();
    }

    public List<User> formGroup() {
        List<User> group = new ArrayList<>();
        synchronized (queue) {
            while (queue.size() < roomSize || !hasAvailableThreads()) {
                try {
                    queue.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return null;
                }
                System.out.println("Queue state:");
                for (User user : queue) {
                    String sign = user.isDisconnected() ? " (disconnected)" : "";
                    System.out.println(user.getUsername() + sign);
                }
            }
            for (User u : queue) {
                if (!u.isDisconnected()) {
                    group.add(u);
                    if (group.size() >= roomSize) {
                        break;
                    }
                }
            }

            for (User u : group) {
                queue.remove(u);
            }
        }
        return group;
    }

    public int remove(User client) {
        synchronized (queue) {
            if (queue.remove(client)) {
                System.out.println("User removed from the queue: " + client.getUsername());
            } else {
                System.out.println("User not found in the queue: " + client.getUsername());
            }
            System.out.println("Queue state:");
            for (User user : queue) {
                System.out.println(user.getUsername());
            }
        }
        return 0;
    }

    private void removeDisconnectedUsers() {
        synchronized (queue) {
            long currentTime = System.currentTimeMillis();
            Iterator<User> iterator = queue.iterator();
            while (iterator.hasNext()) {
                User user = iterator.next();
                if (user.isDisconnected() && (currentTime - user.getDisconnectTime()) >= DISCONNECT_TIMEOUT_MS) {
                    iterator.remove();
                    user.sendMessage(new Message(Message.Context.LEAVEQUEUE, "You have been removed from the queue due to inactivity.").toString());
                }
            }
        }
    }
}

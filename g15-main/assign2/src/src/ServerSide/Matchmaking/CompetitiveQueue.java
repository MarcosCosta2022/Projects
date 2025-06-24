package src.ServerSide.Matchmaking;

import src.ClientServer.Message;
import src.ServerSide.Game;
import src.ServerSide.User;

import java.util.*;

public class CompetitiveQueue extends MatchMaker{
    private final PriorityQueue<User> queue;
    private final int roomSize;
    private boolean running = true;

    public CompetitiveQueue(int roomSize){
        this.roomSize = roomSize;
        this.queue = new PriorityQueue<>(Comparator.comparing(User::getRank));
    }

    public int add(User client) {
        synchronized (queue) {
            queue.add(client);
            queue.notify();
        }
        return 0;
    }

    public void run() {
        System.out.println("Starting ranked queue");
        while(running){
            List<User> group = formGroup();
            if (group != null) {
                // Create a thread to run a game with the group
                Thread.ofVirtual().start(new Game(group));
            }
        }
    }

    public void stop() {
        // remove all users from the queue
        while(!queue.isEmpty()){
            User user = queue.poll();
            user.sendMessage(new Message(Message.Context.LEAVEQUEUE, "You have left the queue.").toString());
        }

        this.running = false;
    }

    public List<User> formGroup() {
        List<User> group = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        synchronized (queue) {
            while (group.size() < roomSize) {
                try {
                    System.out.println("Waiting for players to join the queue");
                    queue.wait(2000); // wait for 2 second
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return null;
                }

                Iterator<User> iterator = queue.iterator();
                while (iterator.hasNext() && group.size() < roomSize) {
                    User user = iterator.next();
                    if (System.currentTimeMillis() - startTime < 60000) {  //wait at most 1 minute for close ranked players to join
                        if (group.isEmpty() || Math.abs(user.getRank() - group.get(0).getRank()) <= 20) {  // close rank is set to 20 up or down
                            group.add(user);
                            iterator.remove();
                        }
                    } else {
                        group.add(user);
                        iterator.remove();
                    }
                }
            }
        }
        return group;
    }

    public int remove(User client) {
        synchronized (queue) {
            if (queue.remove(client)) {
                System.out.println("User removed from the queue: " + client.getUsername());
                client.sendMessage(new Message(Message.Context.LEAVEQUEUE, "You have left the queue.").toString());
            } else {
                System.out.println("User not found in the queue: " + client.getUsername());
            }
            // print state of the queue
            System.out.println("Queue state:");
            for (User user : queue) {
                System.out.println(user.getUsername());
            }
        }
        return 0;
    }

}

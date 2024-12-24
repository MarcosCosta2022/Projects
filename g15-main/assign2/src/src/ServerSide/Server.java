package src.ServerSide;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.locks.ReentrantLock;

import org.json.simple.parser.ParseException;
import src.ClientServer.Message;
import src.ServerSide.Matchmaking.CasualQueue;
import src.ServerSide.Matchmaking.CompetitiveQueue;
import src.ServerSide.Matchmaking.MatchMaker;

public class Server {

    public Database db;
    public MatchMaker queue;
    private boolean run;
    public boolean isRanked;
    public int port;
    public int connected_users;
    public ReentrantLock connect_lock;

    // constants
    private int ROOM_SIZE = 2;
    private int GAME_POOL_SIZE = 1; // 10 simultaneous games
    private int USER_POOL_SIZE = 30; // up to 30 users

    public long DISCONNECT_TIMEOUT_MS = 10000;

    public Server(boolean isRanked, int port) throws IOException, ParseException {
        this.db = new Database("database.json");
        // rooms with 3 people and up to 5 rooms
        if (isRanked){
            this.queue = new CompetitiveQueue(ROOM_SIZE);
        }else{
            this.queue = new CasualQueue(ROOM_SIZE, GAME_POOL_SIZE);
        }
        this.port = port;
        this.isRanked = isRanked;
        this.connected_users= 0;
        this.connect_lock = new ReentrantLock();
    }

    private void start() throws IOException , Exception{
        try {
            // before starting to accept connections, we need to start the matchmaking queues
            Thread.ofVirtual().start(queue);

            ServerSocket serverSocket = new ServerSocket(port);
            System.out.println("Listening for connections...");
            this.run = true;
            while (this.run) {
                Socket cs = serverSocket.accept();

                int con = this.getConnectedUsers();
                System.out.println("Number of connected users: " + con);
                if (con >= USER_POOL_SIZE){
                    // write "Server Full" to the user
                    String m = new Message(Message.Context.SERVERFULL, "Server is full").toString();
                    PrintWriter writer = new PrintWriter(cs.getOutputStream(), true);
                    writer.println(m);
                    cs.close();
                    continue;
                }
                Thread.ofVirtual().start(new ClientHandler(this,cs));
            }
            serverSocket.close();
        } catch (IOException e) {
            System.out.println("Error setting up server socket");
        }
    }

    public void decreaseUsers(){
        connect_lock.lock();
        this.connected_users--;
        connect_lock.unlock();
    }

    public void increaseUsers(){
        connect_lock.lock();
        this.connected_users++;
        connect_lock.unlock();
    }

    public int getConnectedUsers(){
        connect_lock.lock();
        try {
            return this.connected_users;
        } finally {
            connect_lock.unlock();
        }
    }

    public static void main(String[] args) {
        int port, mode;

        switch (args.length) {
            case 3:
                port = Integer.parseInt(args[1]);
                mode = Integer.parseInt(args[2]);
                break;
            case 2:
                port = Integer.parseInt(args[1]);
                mode = 0; // defaults to casual mode
                break;
            case 0:
                port = 8080;
                mode = 0; // defaults to casual mode
                break;
            default:
                Server.printUsage();
                return;
        }

        if (mode != 0 && mode != 1){
            Server.printUsage();
            return;
        }

        try {
            Server server = new Server(mode == 1, port);
            server.start();
        } catch (Exception e){
            System.out.println("Error in launcher");
            e.printStackTrace();
        } finally{
            System.out.println("Server closed");
            // close all threads
            System.exit(0);
        }
    }

    private static void printUsage() {
        System.out.println("usage: java Launcher <PORT> <MODE>");
        System.out.println("       <MODE>");
        System.out.println("           0 - Simple");
        System.out.println("           1 - Ranked");
    }

}

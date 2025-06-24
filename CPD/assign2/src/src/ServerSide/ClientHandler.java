package src.ServerSide;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.ReentrantLock;

import src.ClientServer.Message;
import src.ServerSide.StateMachine.Authenticating;
import src.ServerSide.StateMachine.ServerState;

import static src.ClientServer.Message.Context.*;

public class ClientHandler implements Runnable {
    public Socket cs;
    public Server server;
    public User user;
    public ServerState state;
    public BufferedReader reader;
    public PrintWriter writer;
    public Queue<String> writingQueue;
    public ReentrantLock writingLock;

    public void write(String s){
        writingLock.lock();
        // add the message to the queue
        writingQueue.add(s);
        writingLock.unlock();
        System.out.println("Added message to queue: " + s);
    }

    public void write(Object o){
        write(o.toString());
    }

    public void writingThread(){
        while(running){
            writingLock.lock();
            if (!writingQueue.isEmpty()){
                writer.println(writingQueue.poll());
            }
            writingLock.unlock();
        }
    }

    public boolean running = true;

    public ClientHandler(Server server, Socket cs) {
        this.cs = cs;
        this.server = server;
        this.writingQueue = new LinkedList<>();
        this.writingLock = new ReentrantLock();
    }
    
    @Override
    public void run() {

        // update number of connections
        server.increaseUsers();

        try{
            String response;
            Message m;

            this.reader = new BufferedReader(new InputStreamReader(cs.getInputStream()));
            this.writer = new PrintWriter(cs.getOutputStream(), true);

            System.out.println("Connection established");
            var message = new Message(WELCOME, "Welcome to the Quick Typing Game");
            writer.println(message);
            response = reader.readLine();

            m = Message.parse(response);

            // response must be a Welcome message
            if (m.getContext() != WELCOME){
                System.out.println("Invalid response");
                return;
            }

            this.state = new Authenticating(this);
            // create a thread that deal with input from the client
            var inputThread = Thread.ofVirtual().start(this::readInput);
            var writingThread = Thread.ofVirtual().start(this::writingThread);
            // wait for the thread to finish
            inputThread.join();

            this.user.setDisconnectTime(System.currentTimeMillis());
            this.user.save();
        } catch (IOException e) {
            System.out.println("Error in client handler");
            this.user.setDisconnectTime(System.currentTimeMillis());
            this.user.save();
        } catch (InterruptedException e) {

            throw new RuntimeException(e);
        } finally {
            try {
                cs.close();
            } catch (IOException e) {
                System.out.println("Error closing socket");
            }
        }
        // update number of connections
        server.decreaseUsers();
    }

    public void readInput(){
        while(running){
            try {
                var response = reader.readLine();
                if (response == null){
                    break;
                }
                var m = Message.parse(response);

                if (m.getContext() == EXIT){
                    write(new Message(EXIT, "Goodbye!").toString());
                    break;
                }
                System.out.println("Received message from client: " + m.getText());
                this.state.handleInputFromClient(m);
            } catch (IOException e) {
                System.out.println("Error reading from client");
                break;
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }

}

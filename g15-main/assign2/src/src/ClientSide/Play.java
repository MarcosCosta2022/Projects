package src.ClientSide;
import src.ClientSide.StateMachine.Authentication;
import src.ClientSide.StateMachine.GameState;
import src.ClientServer.Message;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ConnectException;
import java.net.Socket;

public class Play {

    public BufferedReader serverReader;
    public PrintWriter serverWriter;
    public BufferedReader terminalReader;
    public PrintWriter terminalWriter;
    public Socket socket;

    public static boolean running = true;
    public boolean stopReading = false;
    public boolean stopWriting = false;

    public GameState gameState;

    public Play(Socket socket){
        this.socket = socket;
    }

    public int start() throws IOException{

        this.terminalWriter = new PrintWriter(new OutputStreamWriter(System.out), true);
        this.terminalReader = new BufferedReader(new InputStreamReader(System.in));

        OutputStream output = socket.getOutputStream();
        this.serverWriter = new PrintWriter(output, true);

        InputStream input = socket.getInputStream();
        serverReader = new BufferedReader(new InputStreamReader(input));

        // get the first message from the server
        String message = serverReader.readLine();
        // parse it
        var m = Message.parse(message);
        // check context
        if (m.getContext() != Message.Context.WELCOME){
            terminalWriter.println("Invalid response");
            return -1;
        }

        terminalWriter.println(m.getText());

        // send a message back
        serverWriter.println(new Message(Message.Context.WELCOME,"Hello from the client!"));

        // authenticate the user
        gameState = new Authentication(this);

        // create a thread that will listen for input from the server
        Thread t = new Thread(() -> {
            while(!stopReading && running){
                try {
                    String messageFromServer = serverReader.readLine();
                    Message mFS = Message.parse(messageFromServer);

                    // if an exit message is received from the server, then send it back and stop the thread
                    if (mFS.getContext() == Message.Context.EXIT){
                        terminalWriter.println(mFS.getText());
                        serverWriter.println(mFS);
                        running = false;
                        break;
                    }

                    if (gameState == null){
                        break;
                    }
                    // call the state machine
                    gameState.handleInputFromServer(mFS);

                    // if the state is null, then stop thread
                    if (gameState == null){
                        running = false;
                    }
                } catch (IOException e) {
                    terminalWriter.println("Error reading from server");
                }
            }
        });

        // create a thread that will listen for input from the terminal
        Thread t2 = new Thread(() -> {
            while(!stopWriting && running){
                try {
                    String messageFromTerminal = terminalReader.readLine();

                    // call the state machine
                    if (gameState == null){
                        break;
                    }

                    gameState.handleOutputToServer(messageFromTerminal);

                    // if the state is null, then stop thread
                    if (gameState == null){
                        running = false;
                    }
                } catch (IOException e) {
                    terminalWriter.println("Error reading from terminal");
                }
            }
        });

        // wait for the threads to finish
        t.start();
        t2.start();

        // only wait for the thread that listens to the server to finish
        try {
            t.join();
        } catch (InterruptedException e) {
            terminalWriter.println("Error in threads");
        }

        return 0;
    }

    public static void main(String[] args) throws IOException {
        // either 0, 1 or 2 arguments
        // if 0, then defaults to localhost and port 8080
        // if 1, then defaults to localhost

        if ( args.length > 2){
            printUsage();
            return;
        }

        String hostname = "localhost";
        int port = 8080;

        if (args.length >= 1){
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e){
                printUsage();
                return;
            }
        }

        if (args.length == 2){
            hostname = args[1];
        }

        try (Socket socket = new Socket(hostname, port)) {
            var play = new Play(socket);
            play.start();

        } catch (ConnectException e){
            System.out.println("Error connecting to server");
        } catch (IOException e) {
            System.out.println("Error in client");
        }

        System.out.println("Client closed");
    }

    private static void printUsage() {
        System.out.println("usage: java Play [PORT] [HOST]");
    }
}



package src.ClientSide.StateMachine;

import src.ClientSide.Play;
import src.ClientServer.Message;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;

public class Authentication implements GameState{
    int stage;
    // 0: user sends login/register/reconnect,
    // 1: server asks for username,
    // 2: user sends username,
    // 3: server asks for password,
    // 4: user sends password,
    // 5: server sends success or failure
    // 6: request from server for the token
    // 7: send the token

    Play play;
    private String username;
    private String token;
    private boolean isRecon;

    public Authentication(Play play){
        this.play = play;
        printOptions();
        this.stage = 0;
        this.isRecon = false;
    }

    public void printOptions(){
        play.terminalWriter.println("What do you want to do?");
        play.terminalWriter.println("1. Login");
        play.terminalWriter.println("2. Register");
        play.terminalWriter.println("3. Reconnect");
        play.terminalWriter.println("4. Exit");
        play.terminalWriter.print("Enter choice: ");
        play.terminalWriter.flush();
    }

    @Override
    public void handleInputFromServer(Message message) {
        switch (stage) {
            case 1:
                // expects username request
                if (message.getContext() == Message.Context.USERNAME) {
                    play.terminalWriter.println("Username:");
                    stage = 2;
                    return;
                }
                break;
            case 3:
                // expects password request or token request
                if (message.getContext() == Message.Context.PASSWORD) {
                    play.terminalWriter.println("Password:");
                    stage = 4;
                    return;
                }else if(message.getContext() == Message.Context.TOKEN){
                    play.terminalWriter.println("Sending token...");
                    // get token
                    token = getToken(username);
                    play.serverWriter.println(new Message(Message.Context.TOKEN, token));
                    stage = 5;
                } else{
                    play.terminalWriter.println(message.getText());
                    stage = 0;
                    printOptions();
                }
                break;
            case 5:
                // expects success or failure
                if (message.getContext() == Message.Context.AUTHEN_SUCCESS) {
                    play.terminalWriter.println("Login successful");
                    String token = message.getText();

                    try {
                        System.out.println("Storing token...");
                        storeToken(username, token);
                    } catch (IOException e) {
                        play.terminalWriter.println("Error storing token");
                    }
                    goToQueue();
                    return;
                } else if (message.getContext() == Message.Context.AUTHEN_ERROR) {
                    play.terminalWriter.println(message.getText());
                    stage = 0;
                    printOptions();
                    return;
                }
                break;
            default:
                if (message.getContext() == Message.Context.EXIT) {
                    play.terminalWriter.println("Server closed connection");
                    play.gameState = null;
                } else {
                    // return to beginning
                    play.terminalWriter.println("Invalid response at stage "+stage+" : " + message.getText());
                    stage = 0;
                    printOptions();
                }
        }
    }

    private String getToken(String username){
        // get the token from the file named username in the directory "files/tokens"
        File file = new File("files/tokens", username);
        if (!file.exists()) {
            return null;
        }

        try {
            return new String(Files.readAllBytes(file.toPath()));
        } catch (IOException e) {
            return null;
        }
    }

    private void storeToken(String username, String token)throws IOException {
        // store the token in a file named username in the directory "files/tokens"

        File directory = new File("files/tokens");

        // Create file
        File file = new File(directory, username);

        // If it already exists, delete it
        if (file.exists()) {
            file.delete();
        }

        // Create the file
        file.createNewFile();

        // Write the token to the file
        try (FileWriter writer = new FileWriter(file)) {
            writer.write(token);
        }

    }

    @Override
    public void handleOutputToServer(String message) {
        switch (stage) {
            case 0:
                switch (message) {
                    case "login", "1" -> {
                        play.serverWriter.println(new Message(Message.Context.LOGIN, "login"));
                        stage = 1;
                        isRecon = false;
                    }
                    case "register", "2" -> {
                        play.serverWriter.println(new Message(Message.Context.REGISTER, "register"));
                        stage = 1;
                        isRecon = false;
                    }
                    case "reconnect", "3" -> {
                        play.serverWriter.println(new Message(Message.Context.RECONNECT, "reconnect"));
                        stage = 1;
                        isRecon = true;
                    }
                    case "exit", "4" -> {
                        play.serverWriter.println(new Message(Message.Context.EXIT, "Goodbye!"));
                        play.gameState = null;
                    }
                    default -> play.terminalWriter.println("Invalid response. Try Again.");
                }
                break;
            case 2:
                play.serverWriter.println(new Message(Message.Context.USERNAME, message));
                this.username = message;
                stage = 3;
                break;
            case 4:
                play.serverWriter.println(new Message(Message.Context.PASSWORD, message));
                stage = 5;
                break;
            default:
                play.terminalWriter.println("Invalid Input at stage " + stage + ": " + message);
        }
    }

    private void goToQueue(){
        play.gameState = new QueueState(play);
    }
}

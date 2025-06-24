package src.ServerSide;

import src.ClientServer.Message;
import src.ServerSide.StateMachine.GameState;
import src.ServerSide.StateMachine.MainMenu;

import java.util.List;
import static java.lang.Thread.sleep;
import static src.ClientServer.Message.Context.*;

import java.util.concurrent.CountDownLatch;

public class Game implements Runnable {
    private final List<User> players;
    private final int chatTimeLimit;
    private final CountDownLatch latch;
    private int result;
    private String word;
    private boolean gameStarted;
    private boolean gameEnded;

    public Game(List<User> players) {
        this.players = players;
        this.chatTimeLimit = 10;
        this.result = 0;
        this.latch = new CountDownLatch(1);  // Initialize CountDownLatch with count 1
    }

    public void run() {
        gameStarted = false;
        gameEnded = false;

        // Change every user's state to game
        for (User player : players) {
            player.clientHandler.state = new GameState(this, player.clientHandler);
        }
        // Signal the match has started
        announce(new Message(GAMEFOUND, "Game found! You are playing with " + players.size() + " players"));

        // Start the typing game
        quickTyping();

        // Signal the match has ended
        for (User user : players) {
            var message = new Message(MATCH_END, "Match ended");
            user.sendMessage(message.toString());
            user.clientHandler.state = new MainMenu(user.clientHandler);
        }
    }

    private void announce(Message m) {
        for (User player : players) {
            sendMessage(m, player);
        }
    }

    private void quickTyping() {
        // Create a list of words
        String[] words = {"apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", "quince", "raspberry", "strawberry", "tangerine", "watermelon"};
        // Randomly select a word
        int wordIndex = (int) (Math.random() * words.length);
        String word = words[wordIndex];
        this.word = word;

        announce(new Message(GAMESTART, "---- Type the word as fast as you can: " + word + " -----"));
        gameStarted = true;

        try {
            // Wait for the latch to be decremented, effectively pausing this method until gameEnded is true
            latch.await();
        } catch (InterruptedException e) {
            System.out.println("Couldn't wait");
        }
    }

    public void randomGame() {
        try {
            sleep(30000);
        } catch (InterruptedException e) {
            System.out.println("Couldn't sleep");
        }

        // Randomly set the result of the game
        this.result = (int) (Math.random() * 2);
        if (this.result == 0) {
            System.out.println("Game ended in a draw");
            // Make all the players draw
            for (User player : players) {
                sendMessage(new Message(RESULT, "!!! YOU DRAW !!!"), player);
            }
        } else {
            System.out.println("Game ended with a winner");
            // Randomly select a winner
            int winnerIndex = (int) (Math.random() * players.size());
            for (int i = 0; i < players.size(); i++) {
                if (i == winnerIndex) {
                    sendMessage(new Message(RESULT, "!!! YOU WON !!!"), players.get(i));
                    players.get(i).setRank(players.get(i).getRank() + 10);
                    players.get(i).save();
                } else {
                    sendMessage(new Message(RESULT, "!!! YOU LOST !!!"), players.get(i));
                    if (players.get(i).getRank() != 0) {
                        players.get(i).setRank(players.get(i).getRank() - 5);
                        players.get(i).save();
                    }
                }
            }
        }
    }

    public void sendMessage(Message message, User user) {
        // Create a thread to send message so the user doesn't bring the game to a crawl
        Thread.ofVirtual().start(() -> user.sendMessage(message.toString()));
    }

    public void userInput(User user, Message message) {
        // This function is run by a separate thread for every input from all the users
        if (message.getContext() == GAMEMESSAGE && gameStarted && !gameEnded) {
            // First broadcast the message to all the users
            var m = new Message(GAMEMESSAGE, user.getUsername() + " : " + message.getText());
            for (User player : players) {
                if (player != user) {
                    sendMessage(m, player);
                }
            }

            System.out.println("User " + user.getUsername() + " typed: " + message.getText());
            System.out.println("Expected word: " + word);

            if (message.getText().trim().equalsIgnoreCase(word)) {
                gameEnded = true;
                sendMessage(new Message(RESULT, "!! You won !!"), user);
                user.setRank(user.getRank() + 10);
                user.save();
                for (User otherPlayer : players) {
                    if (otherPlayer != user) {
                        m = new Message(RESULT, "You lost. The winner was " + user.getUsername());
                        sendMessage(m, otherPlayer);
                        if (otherPlayer.getRank() != 0) {
                            otherPlayer.setRank(otherPlayer.getRank() - 5);
                            otherPlayer.save();
                        }
                    }
                }
                latch.countDown(); // Decrement the latch, allowing quickTyping to proceed
            }
        }
    }
}

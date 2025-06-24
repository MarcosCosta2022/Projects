package src.ClientSide.StateMachine;

import src.ClientSide.Play;
import src.ClientServer.Message;

public class Menu implements GameState{

    public Play play;

    public int stage;
    // 0: user sends choice
    // 1: server sends confirmation message

    public String choice;

    public Menu(Play play){
        this.play = play;
        play.terminalWriter.println("What do you want to do?");
        play.terminalWriter.println("1. Play again");
        play.terminalWriter.println("2. Exit");
        play.terminalWriter.print("Enter choice: ");
        play.terminalWriter.flush();
    }

    @Override
    public void handleInputFromServer(Message message) {
        if (stage == 1) {// expects confirmation
            if (message.getContext() == Message.Context.INQUEUE) {
                play.terminalWriter.println(message.getText());
                goToQueue();
                return;
            }
        } else {
            play.terminalWriter.println("Invalid response : " + message.getText());
        }
    }

    public void goToQueue(){
        play.gameState = new QueueState(play);
    }

    @Override
    public void handleOutputToServer(String message) {
        if (stage == 0) {
            if (message.equals("1") || message.equals("2")) {
                choice = message;
                if (message.equals("2")) {
                    play.serverWriter.println(new Message(Message.Context.EXIT, "Goodbye!"));
                    play.gameState = null;
                    return;
                } else {
                    play.serverWriter.println(new Message(Message.Context.PLAY, message));
                }
                stage = 1;
            } else {
                play.terminalWriter.println("Invalid response");
            }
        }else{
            play.terminalWriter.println("Invalid response");
        }
    }
}

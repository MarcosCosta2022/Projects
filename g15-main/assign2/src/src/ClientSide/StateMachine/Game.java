package src.ClientSide.StateMachine;

import src.ClientSide.Play;
import src.ClientServer.Message;

public class Game implements GameState {

    public Play play;

    public Game(Play play) {
        this.play = play;
    }

    @Override
    public void handleInputFromServer(Message message) {
        play.terminalWriter.println(message.getText());

        if (message.getContext() == Message.Context.MATCH_END) {
            play.gameState = new Menu(play);
        } else if (message.getContext() != Message.Context.GAMEFOUND
                && message.getContext() != Message.Context.GAMEMESSAGE
                && message.getContext() != Message.Context.GAMESTART
                && message.getContext() != Message.Context.RESULT
        ){
            System.out.println("Invalid context : " + message.getContext());
            play.terminalWriter.println("Invalid response : " + message.getText());
        }
    }

    @Override
    public void handleOutputToServer(String message) {
        play.serverWriter.println(new Message(Message.Context.GAMEMESSAGE, message));
    }
}
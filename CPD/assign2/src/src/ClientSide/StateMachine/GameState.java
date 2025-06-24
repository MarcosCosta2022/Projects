package src.ClientSide.StateMachine;

import src.ClientServer.Message;

public interface GameState {
    void handleInputFromServer(Message message);
    void handleOutputToServer(String message);
}

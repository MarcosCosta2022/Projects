package src.ServerSide.StateMachine;

import src.ClientServer.Message;
import src.ServerSide.ClientHandler;
import src.ServerSide.Game;

public class GameState extends ServerState{

    Game game;

    public GameState(Game game, ClientHandler clientHandler) {
        super(clientHandler);
        this.game = game;
    }

    @Override
    public void handleInputFromClient(Message message) {
        game.userInput(this.clientHandler.user, message);
    }
}

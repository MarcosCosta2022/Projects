package src.ServerSide.StateMachine;

import src.ClientServer.Message;
import src.ServerSide.ClientHandler;

public abstract class ServerState{
    ClientHandler clientHandler;

    ServerState(ClientHandler clientHandler){
        this.clientHandler = clientHandler;
    }

    public abstract void handleInputFromClient(Message message) throws InterruptedException;
}

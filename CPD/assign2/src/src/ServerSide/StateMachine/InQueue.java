package src.ServerSide.StateMachine;

import src.ClientServer.Message;
import src.ServerSide.ClientHandler;

public class InQueue extends ServerState {

    public InQueue(ClientHandler clientHandler) {
        super(clientHandler);
    }
    @Override
    public void handleInputFromClient(Message message) {
        if (message.getContext() == Message.Context.LEAVEQUEUE) {
            clientHandler.server.queue.remove(clientHandler.user);
            clientHandler.write(new Message(Message.Context.LEAVEQUEUE, "You have left the queue"));
            clientHandler.state = new MainMenu(clientHandler);
            System.out.println("Removed a user from the queue");
        }
    }
}


package src.ServerSide.StateMachine;

import src.ClientServer.Message;
import src.ServerSide.ClientHandler;

public class MainMenu extends ServerState{

    public MainMenu(ClientHandler clientHandler) {
        super(clientHandler);
    }

    @Override
    public void handleInputFromClient(Message message) throws InterruptedException {
        if (message.getContext() == Message.Context.PLAY) {
            goToQueue();
            return;
        }

        clientHandler.write(new Message(Message.Context.EXIT, "Invalid response: "+message.getText()));
        clientHandler.state = null;
    }

    public void goToQueue() throws InterruptedException {
        int error = clientHandler.server.queue.add(clientHandler.user);

        if (error == 0) {
            String queueType = clientHandler.server.isRanked ? "ranked" : "casual";
            String rankInfo = clientHandler.server.isRanked ? " with rank " + clientHandler.user.getRank() : "";
            String message = "You have joined the " + queueType + " queue" + rankInfo;

            clientHandler.write(new Message(Message.Context.INQUEUE, message));
            clientHandler.state = new InQueue(clientHandler);
        } else {
            clientHandler.write(new Message(Message.Context.ERROR, "Error joining queue"));
            clientHandler.state = new MainMenu(clientHandler);
        }
    }


}

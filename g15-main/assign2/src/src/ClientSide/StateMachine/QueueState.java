package src.ClientSide.StateMachine;
import src.ClientSide.Play;
import src.ClientServer.Message;

public class QueueState implements GameState{

    public Play play;

    public QueueState(Play play){
        this.play = play;
    }

    @Override
    public void handleInputFromServer(Message message) {
        if (message.getContext() == Message.Context.INQUEUE) {
            play.terminalWriter.println(message.getText());
            return;
        } else if (message.getContext() == Message.Context.GAMEFOUND) {
            goToGame();
            return;
        } else if (message.getContext() == Message.Context.LEAVEQUEUE){
            play.terminalWriter.println("You left the queue");
            play.gameState = new Menu(play);
            return;
        }

        play.terminalWriter.println("Invalid response from Server in Queue Phase");
        play.serverWriter.println(new Message(Message.Context.EXIT, "Invalid response : "+ message.getText()));
    }

    @Override
    public void handleOutputToServer(String message) {
        if (message.equals("leave")){
            play.serverWriter.println(new Message(Message.Context.LEAVEQUEUE, "Leave Queue"));
            return;
        }

        play.serverWriter.println(new Message(Message.Context.INQUEUE, message));
    }

    public void goToGame(){
        play.terminalWriter.println("Match found!");
        play.gameState = new Game(play);
    }
}

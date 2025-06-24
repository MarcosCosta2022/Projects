package src.ServerSide.StateMachine;

import src.ClientServer.Message;
import src.ServerSide.ClientHandler;

import static src.ClientServer.Message.Context.AUTHEN_ERROR;
import static src.ClientServer.Message.Context.AUTHEN_SUCCESS;

public class Authenticating extends ServerState{


    public int stage = 0;
    // stage 0 : expects login/register/reconnect
    // stage 1 : expects username
    // stage 2 : expects password
    // stage 3 : expects a token

    public int type ; // 1 = login, 2 = register, 3 = reconnect
    public String username;
    public String password;

    private long DISCONNECT_TIME = 600000;


    public Authenticating(ClientHandler clientHandler){
        super(clientHandler);
    }

    @Override
    public void handleInputFromClient(Message message) throws InterruptedException {
        switch (stage) {
            case 0:
                switch (message.getContext()) {
                    case LOGIN:
                        type = 1;
                        break;
                    case REGISTER:
                        type = 2;
                        break;
                    case RECONNECT:
                        type = 3;
                        break;
                    default:
                        clientHandler.writer.println(new Message(AUTHEN_ERROR, "Invalid response"));
                        // go to the beginning
                        resetStage();
                        return;
                }
                clientHandler.writer.println(new Message(Message.Context.USERNAME, "Enter username: "));
                stage = 1;
                break;
            case 1:
                if (!message.checkContext(Message.Context.USERNAME)){
                    clientHandler.write(new Message(AUTHEN_ERROR, "Invalid response"));
                    // go to the beginning
                    resetStage();
                    return;
                }
                username = message.getText();

                if (type == 3){
                    // ask for token
                    clientHandler.write(new Message(Message.Context.TOKEN, "Enter Token: "));
                    stage = 3;
                    return;
                }

                clientHandler.write(new Message(Message.Context.PASSWORD, "Enter password: "));
                stage = 2;
                break;
            case 2:
                if (!message.checkContext(Message.Context.PASSWORD)){
                    clientHandler.write(new Message(AUTHEN_ERROR, "Invalid response"));
                    // go to the beginning
                    resetStage();
                    return;
                }
                password = message.getText();

                if (type == 1) {
                    login();
                } else if (type == 2) {
                    register();
                }
                break;
            case 3:
                if (message.checkContext(Message.Context.TOKEN)){
                    // check tokens validity
                    var user = clientHandler.server.db.getUser(this.username);
                    var userToken = user.getToken();
                    var disconnectTime = user.getDisconnectTime();
                    var diff = System.currentTimeMillis() - disconnectTime;

                    if (userToken != null && userToken.equals(message.getText()) && diff < DISCONNECT_TIME){
                        // authentication successful

                        clientHandler.user = clientHandler.server.db.getUser(this.username);
                        if (clientHandler.user == null){
                            var mR = new Message(AUTHEN_ERROR, "User does not exist.");
                            clientHandler.write(mR);
                            // go to the beginning
                            resetStage();
                        }else {
                            clientHandler.user.clientHandler = clientHandler;
                            clientHandler.write(new Message(AUTHEN_SUCCESS, userToken));
                            user.setDisconnectTime(-1);
                            goToQueue();
                        }
                    }else{
                        clientHandler.write(new Message(AUTHEN_ERROR, "Invalid Token"));
                        stage = 0;
                    }
                }
                break;
        }
    }

    private void resetStage() {
        stage = 0;
    }

    public void login() throws InterruptedException {

        if (!clientHandler.server.db.userExists(this.username) || !clientHandler.server.db.checkPassword(this.username, this.password)) {
            clientHandler.write(new Message(AUTHEN_ERROR, "User does not exist or incorrect password."));
            resetStage();
            return;
        }

        clientHandler.user = clientHandler.server.db.getUser(this.username);
        if (clientHandler.user == null){
            clientHandler.write(new Message(AUTHEN_ERROR, "User retrieval failed."));
            resetStage();
            return;

        }

        clientHandler.user.clientHandler = clientHandler;
        String token = clientHandler.server.db.generateToken(username);
        clientHandler.user.setToken(token);
        clientHandler.user.save();

        // send success message
        clientHandler.write(new Message(Message.Context.AUTHEN_SUCCESS, token));
        //System.out.println("Sent token");
        // go to the main menu
        clientHandler.user.setDisconnectTime(-1);
        goToQueue();
    }

    public void goToQueue() throws InterruptedException {
        if (clientHandler == null){
            System.out.println("Client handler is null");
            // exit
            clientHandler.write(new Message(Message.Context.EXIT, "Client handler is null"));
            return;
        }

        clientHandler.user.clientHandler = clientHandler;

        if (clientHandler.server.queue.add(clientHandler.user) == 0) {
            String message = "You have joined the " + (clientHandler.server.isRanked ? "ranked" : "casual") + " queue";
            if (clientHandler.server.isRanked){

                message += " with rank "+ clientHandler.user.getRank();
            }

            clientHandler.write(new Message(Message.Context.INQUEUE, message));
            clientHandler.state = new InQueue(clientHandler);
        } else {
            clientHandler.write(new Message(Message.Context.ERROR, "Error joining queue"));
            clientHandler.state = new MainMenu(clientHandler);
        }
    }

    public void register() throws InterruptedException {
        if (clientHandler.server.db.userExists(this.username)){

            clientHandler.write("User already exists. Returning to main menu.");
            resetStage();

            return;
        }
        clientHandler.user = clientHandler.server.db.addUser(this.username, this.password);
        if (clientHandler.user == null){

            clientHandler.write(new Message(AUTHEN_ERROR, "User creation failed."));
            resetStage();
            return;
        }
        // send success message
        clientHandler.write(new Message(Message.Context.AUTHEN_SUCCESS, "Successfully registered."));
        clientHandler.user.clientHandler = clientHandler;
        // go to the main menu
        clientHandler.user.setDisconnectTime(-1);
        goToQueue();
    }
}

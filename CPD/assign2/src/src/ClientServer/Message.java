package src.ClientServer;

public class Message {
    public enum Context {
        RECONNECT,
        USERNAME,
        PASSWORD,
        AUTHEN_ERROR,
        AUTHEN_SUCCESS,
        LEAVEQUEUE,
        EXIT,
        WELCOME,
        LOGIN,
        REGISTER,
        ERROR,
        INQUEUE,
        GAMEFOUND,
        RESULT,
        GAMEMESSAGE,
        MATCH_END,
        TOKEN,
        PLAY,
        SERVERFULL,
        GAMESTART
    }

    private Context context;
    private String effectiveMessage;

    public Message(Context context, String effectiveMessage) {
        this.context = context;
        this.effectiveMessage = effectiveMessage;
    }

    public Context getContext() {
        return context;
    }

    public String getText() {
        return effectiveMessage;
    }

    @Override
    public String toString() {
        return context.name().toLowerCase() + ":" + effectiveMessage;
    }

    public static Message parse(String messageStr) throws IllegalArgumentException {
        if (messageStr == null) {
            throw new IllegalArgumentException("Message string is null");
        }
        String[] parts = messageStr.split(":", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid message format: "+ messageStr);
        }
        try {
            Context context = Context.valueOf(parts[0].toUpperCase());
            String effectiveMessage = parts[1];
            return new Message(context, effectiveMessage);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid context in message: "+ messageStr);
        }
    }

    public boolean checkContext(Context context) {
        return this.context == context;
    }
}
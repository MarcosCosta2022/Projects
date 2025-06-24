create schema if not exists lbaw2325;

SET DateStyle TO European;

-- Drop triggers

-- Drop trigger for BR02
DROP TRIGGER IF EXISTS prevent_duplicate_friend_request_and_request_to_self_trigger ON friendrequest CASCADE;

-- Drop trigger for BR07
DROP TRIGGER IF EXISTS prevent_invalid_post_likes_trigger ON reaction CASCADE;

-- Drop trigger for BR08
DROP TRIGGER IF EXISTS prevent_posts_in_group_from_non_member_trigger ON post CASCADE;

-- Drop trigger for BR09
DROP TRIGGER IF EXISTS prevent_invalid_post_comments_trigger ON comment CASCADE;

-- Drop trigger for BR03
DROP TRIGGER IF EXISTS prevent_duplicate_reactions_trigger ON reaction CASCADE;

-- Drop trigger for BR11
DROP TRIGGER IF EXISTS prevent_following_self_trigger ON follow CASCADE;

-- Drop functions

-- Drop function for BR02
DROP FUNCTION IF EXISTS prevent_duplicate_friend_request CASCADE;

-- Drop function for BR07
DROP FUNCTION IF EXISTS prevent_invalid_post_likes CASCADE;

-- Drop function for BR08
DROP FUNCTION IF EXISTS prevent_posts_in_group_from_non_member CASCADE;

-- Drop function for BR09
DROP FUNCTION IF EXISTS prevent_invalid_post_comments CASCADE;

-- Drop function for BR03
DROP FUNCTION IF EXISTS prevent_duplicate_reactions CASCADE;

-- Drop function for BR11
DROP FUNCTION IF EXISTS prevent_following_self CASCADE;

-- Drop indexes

-- Drop indexes for user search
DROP INDEX IF EXISTS user_search_idx CASCADE;

-- Drop indexes for group search
DROP INDEX IF EXISTS group_search_idx CASCADE;

-- Drop indexes for post search
DROP INDEX IF EXISTS post_search_idx CASCADE;

-- Drop types

-- Drop type reactiontype
DROP TYPE IF EXISTS reactiontype CASCADE;

-- Drop type notificationtype
DROP TYPE IF EXISTS notificationtype CASCADE;

-- Drop type friendrequeststate
DROP TYPE IF EXISTS friendrequeststate CASCADE;

-- Drop type profilestate
DROP TYPE IF EXISTS profilestate CASCADE;

-- Drop tables

-- Drop table notification
DROP TABLE IF EXISTS notification CASCADE;

-- Drop table reaction
DROP TABLE IF EXISTS reaction CASCADE;

-- Drop table groupMember
DROP TABLE IF EXISTS groupmember CASCADE;

-- Drop table follow
DROP TABLE IF EXISTS follow CASCADE;

-- Drop table friendrequest
DROP TABLE IF EXISTS friendrequest CASCADE;

-- Drop table comment
DROP TABLE IF EXISTS comment CASCADE;

-- Drop table post
DROP TABLE IF EXISTS post CASCADE;

-- Drop table groups
DROP TABLE IF EXISTS groups CASCADE;

-- Drop table users
DROP TABLE IF EXISTS users CASCADE;

-- Drop table profile
DROP TABLE IF EXISTS profile CASCADE;
-----------------------------------------
-- Types
-----------------------------------------

CREATE TYPE reactiontype AS ENUM('ReactionComment', 'ReactionPost');
CREATE TYPE notificationtype AS ENUM('CommentNotification', 'FriendRequestNotification', 'LikedPost', 'NewFollower');
CREATE TYPE friendrequeststate AS ENUM('Accepted', 'Refused', 'Pending');
CREATE TYPE profilestate AS ENUM('public', 'private', 'blocked');



-----------------------------------------
-- Tables
-----------------------------------------

-- Note that a plural 'users' name was adopted because user is a reserved word in PostgreSQL.

CREATE TABLE profile (
   id SERIAL PRIMARY KEY,
   bio TEXT,
   birthdate INT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now())
);

CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   first_name TEXT NOT NULL,
   last_name TEXT NOT NULL,
   username TEXT NOT NULL CONSTRAINT user_username_uk UNIQUE,
   email TEXT NOT NULL CONSTRAINT user_email_uk UNIQUE,
   password TEXT NOT NULL,
   img TEXT,
   is_admin BOOLEAN NOT NULL DEFAULT FALSE,
   profilestate TEXT NOT NULL DEFAULT 'private',
   id_profile INT NOT NULL REFERENCES profile(id) ON UPDATE CASCADE
);

CREATE TABLE groups (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   description TEXT,
   picture TEXT
);

CREATE TABLE post (
   id SERIAL PRIMARY KEY,
   id_user INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   content TEXT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   visibility INT,
   picture TEXT,
   group_id INTEGER DEFAULT NULL REFERENCES groups(id) ON UPDATE CASCADE -- if null then user didnt post in a group
);

CREATE TABLE comment (
   id SERIAL PRIMARY KEY,
   content TEXT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_user INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   id_post INT NOT NULL REFERENCES post(id) ON UPDATE CASCADE
);


CREATE TABLE groupMember (
   id_group INT NOT NULL REFERENCES groups(id) ON UPDATE CASCADE,
   id_user INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   isgroupadmin BOOLEAN NOT NULL,
   PRIMARY KEY (id_user, id_group)
);

CREATE TABLE follow (
   id_follower INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   id_followed INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   PRIMARY KEY (id_followed,id_follower)
);

CREATE TABLE friendrequest (
   friendrequeststate TEXT NOT NULL DEFAULT 'Pending',
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_sender INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   id_receiver INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   PRIMARY KEY (id_sender , id_receiver)
);


--TODO
CREATE TABLE reaction (
   id SERIAL PRIMARY KEY,
   liked BOOLEAN NOT NULL,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   reactiontype TEXT,
   id_post INT REFERENCES post(id) ON UPDATE CASCADE,
   id_comment INT REFERENCES comment(id) ON UPDATE CASCADE,
   id_user INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   CHECK (
        (reactiontype = 'ReactionComment' AND id_comment IS NOT NULL AND id_post IS NULL) OR
        (reactiontype = 'ReactionPost' AND id_post IS NOT NULL AND id_comment IS NULL)
   )
);


--TODO
CREATE TABLE notification (
   id SERIAL PRIMARY KEY,
   liked BOOLEAN NOT NULL,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   notificationtype TEXT,
   read BOOLEAN NOT NULL DEFAULT FALSE,
   id_reaction INT  REFERENCES reaction(id) ON UPDATE CASCADE,
   id_comment INT  REFERENCES comment(id) ON UPDATE CASCADE,
   id_user INT REFERENCES users(id) ON UPDATE CASCADE,
   id_friendrequestSender INT,
   id_follower INT ,
   CONSTRAINT friendrequestreference FOREIGN KEY (id_friendrequestSender, id_user) REFERENCES friendrequest(id_sender,id_receiver),
   CONSTRAINT followReference FOREIGN KEY (id_follower,id_user) REFERENCES follow(id_follower,id_followed),
   CHECK (
        (notificationtype = 'CommentNotification' AND id_comment IS NOT NULL) OR
        (notificationtype = 'FriendRequestNotification' AND id_friendrequestSender IS NOT NULL) OR
        (notificationtype = 'LikedPost' AND id_reaction IS NOT NULL) OR
        (notificationtype = 'NewFollower' AND id_follower IS NOT NULL)
   )
);

-----------------------------------------
-- INDEXES
-----------------------------------------
CREATE INDEX user_post ON post USING btree (id_user);
CLUSTER post USING user_post;

CREATE INDEX post_comment ON Comment USING hash (id_post);

CREATE INDEX post_reaction ON Reaction USING btree (id_post);
 
CREATE INDEX followed_user ON Follow USING hash (id_followed);

-----------------------------------------
-- FTS INDEXES
-----------------------------------------

-- Index for user table
ALTER TABLE users
ADD COLUMN tsvectors TSVECTOR;
-- Function to update ts_vectors for user table
CREATE OR REPLACE FUNCTION user_search_update() RETURNS TRIGGER AS $$
BEGIN
 IF TG_OP = 'INSERT' THEN
      NEW.tsvectors = (
         setweight(to_tsvector('english', NEW.first_name), 'A') ||
         setweight(to_tsvector('english', NEW.last_name), 'B') ||
         setweight(to_tsvector('english', NEW.username), 'C')
          );
END IF;
 IF TG_OP = 'UPDATE' THEN
      IF (NEW.first_name <> OLD.first_name OR NEW.last_name <> OLD.last_name OR NEW.username <> OLD.username) THEN 
         NEW.tsvectors = (
            setweight(to_tsvector('english', NEW.first_name), 'A') ||
            setweight(to_tsvector('english', NEW.last_name), 'B') ||
            setweight(to_tsvector('english', NEW.username), 'C') 
         );
      END IF;
   END IF;
   RETURN NEW;
   END $$
   LANGUAGE plpgsql;
-- Trigger for user table
 CREATE TRIGGER user_search_update 
 BEFORE INSERT OR UPDATE ON users
 FOR EACH ROW
 EXECUTE PROCEDURE user_search_update();
-- GIN index for user table 
CREATE INDEX user_search_idx ON users USING GIN (tsvectors);



-- Index for group table
ALTER TABLE groups 
ADD COLUMN tsvectors TSVECTOR;
-- Function to update ts_vectors for group table
CREATE OR REPLACE FUNCTION group_search_update() RETURNS TRIGGER AS $$
BEGIN
   IF TG_OP = 'INSERT' THEN
      NEW.tsvectors = (
         setweight(to_tsvector('english', NEW.name), 'A') ||
         setweight(to_tsvector('english', NEW.description), 'B') 
         );
   END IF;
    IF TG_OP = 'UPDATE' THEN
         IF (NEW.name <> OLD.name OR NEW.description <> OLD.description) THEN
         NEW.tsvectors = (
            setweight(to_tsvector('english', NEW.name), 'A') ||
            setweight(to_tsvector('english', NEW.description), 'B')
            );
         END IF;
    END IF;
    RETURN NEW;
   END $$
   LANGUAGE plpgsql;

      -- Trigger for group table
   CREATE TRIGGER group_search_update
   BEFORE INSERT OR UPDATE ON groups
   FOR EACH ROW
   EXECUTE PROCEDURE group_search_update();
      
   -- GIN index for user table
   CREATE INDEX group_search_idx ON groups USING GIN (tsvectors);



   -- Index for post table
   ALTER TABLE post
   ADD COLUMN tsvectors TSVECTOR;

   -- Function to update ts_vectors for post table
   CREATE OR REPLACE FUNCTION post_search_update() RETURNS TRIGGER AS $$
   BEGIN 
      IF TG_OP = 'INSERT' THEN 
         NEW.tsvectors = setweight(to_tsvector('english', NEW.content), 'A');
      END IF;
      IF TG_OP = 'UPDATE' THEN
         IF (NEW.content <> OLD.content) THEN 
            NEW.tsvectors = setweight(to_tsvector('english', NEW.content), 'A');
         END IF;
      END IF;
         RETURN NEW;
   END $$ 
   LANGUAGE plpgsql;

   -- Trigger for post table
   CREATE TRIGGER post_search_update
   BEFORE INSERT OR UPDATE ON Post
   FOR EACH ROW 
   EXECUTE PROCEDURE post_search_update();
   
   -- GIN index for user table
   CREATE INDEX post_search_idx ON post USING GIN (tsvectors);


-----------------------------------------
-- TRIGGERS
-----------------------------------------


-- for BR02
CREATE OR REPLACE FUNCTION prevent_duplicate_friend_request_and_request_to_self()
RETURNS TRIGGER AS $$ 
BEGIN
    -- Check if a friendship already exists in either direction
    IF EXISTS (
        SELECT 1
        FROM friendrequest fr
        WHERE (fr.id_sender = NEW.id_sender AND fr.id_receiver = NEW.id_receiver )
           OR (fr.id_sender = NEW.id_receiver AND fr.id_receiver = NEW.id_sender )
    ) THEN
        RAISE EXCEPTION 'Friendship already exists, friend request not allowed';
    END IF;

    IF NEW.id_sender = NEW.id_receiver THEN
        RAISE EXCEPTION 'You cannot send a friend request to yourself.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your friend requests table
CREATE TRIGGER prevent_duplicate_friend_request_and_request_to_self_trigger
BEFORE INSERT ON friendrequest
FOR EACH ROW 
EXECUTE FUNCTION prevent_duplicate_friend_request_and_request_to_self();

-- for BR07

-- A user can only like or dislike posts from public users or users they are friends with
CREATE OR REPLACE FUNCTION prevent_invalid_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is trying to like a post by a public user or a friend
    IF NEW.id_post IS NOT NULL AND NEW.reactiontype = 'post' AND NOT EXISTS (
        SELECT 1
        FROM post p
        WHERE p.id = NEW.id_post AND (
            p.id_user = NEW.id_user -- The user is the owner of the post
            OR
            (p.id_user <> NEW.id_user AND 
                EXISTS (
                    SELECT 1
                    FROM users u
                    WHERE (u.id = p.id_user AND u.profilestate = 'Public')
                )
            ) -- The user is liking a post from a public profile
            OR
            EXISTS (
                SELECT 1
                FROM friendrequest f
                WHERE (
                    (f.id_sender = NEW.id_user AND f.id_receiver = p.id_user AND f.friendrequeststate = 'accepted')
                    OR
                    (f.id_sender = p.id_user AND f.id_receiver = NEW.id_user AND f.friendrequeststate = 'accepted')
                )
            ) -- The user is friends with the owner of the post
        )
    ) THEN
        RAISE EXCEPTION 'You can only like posts from public users or friends.';
    END IF;

    IF NEW.id_comment IS NOT NULL AND NEW.reactiontype = 'comment' AND NOT EXISTS (
         SELECT 1
         from comment c join post p on c.id_post = p.id
         WHERE c.id = NEW.id_comment AND (
               p.id_user = NEW.id_user -- The user is the owner of the post
               OR
               (p.id_user <> NEW.id_user AND 
                  EXISTS (
                     SELECT 1
                     FROM users u
                     WHERE (u.id = p.id_user AND u.profilestate = 'Public')
                  )
               ) -- The user is commenting on a post from a public profile
               OR
               EXISTS (
                  SELECT 1
                  FROM friendrequest f
                  WHERE (
                     (f.id_sender = NEW.id_user AND f.id_receiver = p.id_user AND f.friendrequeststate = 'accepted')
                     OR
                     (f.id_sender = p.id_user AND f.id_receiver = NEW.id_user AND f.friendrequeststate = 'accepted')
                  )
               )
         )
      ) THEN
         RAISE EXCEPTION 'You can only like comments on posts from public profiles or friends.';
      END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your post_likes table (adjust the table and column names)
CREATE TRIGGER prevent_invalid_post_likes_trigger
BEFORE INSERT ON reaction
FOR EACH ROW
EXECUTE FUNCTION prevent_invalid_post_likes();


-- for BR08

CREATE OR REPLACE FUNCTION prevent_posts_in_group_from_non_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user attempting to send the post is a member of the group
    IF NOT EXISTS (
        SELECT 1
        FROM groupmember gm
        WHERE gm.id_group = NEW.group_id
        AND gm.id_user = NEW.id_user
    ) THEN
        RAISE EXCEPTION 'You can only send posts in groups you belong to.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your post table (adjust the table and column names)
CREATE TRIGGER prevent_posts_in_group_from_non_member_trigger
BEFORE INSERT ON post
FOR EACH ROW
WHEN (NEW.group_id IS NOT NULL)
EXECUTE FUNCTION prevent_posts_in_group_from_non_member();

-- for BR09

CREATE OR REPLACE FUNCTION prevent_invalid_post_comments()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is trying to comment on a post made by a public user or a friend
    IF NOT EXISTS (
        SELECT 1
        FROM post p
        WHERE p.id = NEW.id_post
        AND (
            p.id_user = NEW.id_user -- The user is the owner of the post
            OR
            (p.id_user <> NEW.id_user AND 
                EXISTS (
                    SELECT 1
                    FROM users u
                    WHERE (u.id = p.id_user AND u.profilestate = 'Public')
                )
            ) -- The user is commenting on a post from a public profile
            OR
            EXISTS (
                SELECT 1
                FROM friendrequest f
                WHERE (
                    (f.id_sender = NEW.id_user AND f.id_receiver = p.id_user AND f.friendrequeststate = 'accepted')
                    OR
                    (f.id_sender = p.id_user AND f.id_receiver = NEW.id_user AND f.friendrequeststate = 'accepted')
                )
            ) -- The user is friends with the owner of the post
            OR 
            (p.group_id = NULL AND EXISTS(
                SELECT 1
                FROM groups g JOIN groupMember gm ON g.id = gm.id_group
                WHERE ( 
                    gm.id_user = NEW.id_user AND
                    p.group_id = g.id
                )
            ))
        )
    ) THEN
        RAISE EXCEPTION 'You can only comment on posts from public profiles or friends, or posts in  groups you are a part of.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your comment table (adjust the table and column names)
CREATE TRIGGER prevent_invalid_post_comments_trigger
BEFORE INSERT ON comment
FOR EACH ROW
EXECUTE FUNCTION prevent_invalid_post_comments();

-- for BR03

CREATE OR REPLACE FUNCTION prevent_duplicate_reactions()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a reaction already exists in either direction
    IF NEW.reactiontype = 'comment' AND EXISTS(
        SELECT 1
        FROM reaction r
        WHERE r.id_user = NEW.id_user AND r.id_comment = NEW.id_comment
    ) THEN
        RAISE EXCEPTION 'Reaction already exists, reaction not allowed';
    END IF;

    IF NEW.reactiontype = 'post' AND EXISTS(
        SELECT 1
        FROM reaction r
        WHERE r.id_user = NEW.id_user AND r.id_post = NEW.id_post AND r.reactiontype = 'post'
    ) THEN
        RAISE EXCEPTION 'Reaction already exists, reaction not allowed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your reaction table (adjust the table and column names)
CREATE TRIGGER prevent_duplicate_reactions_trigger
BEFORE INSERT ON reaction
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_reactions();

-- BR11:

-- A user can't follow themselves

CREATE OR REPLACE FUNCTION prevent_following_self()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_follower = NEW.id_followed THEN
        RAISE EXCEPTION 'You cannot follow yourself.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your follow table (adjust the table and column names)
CREATE TRIGGER prevent_following_self_trigger
BEFORE INSERT ON follow
FOR EACH ROW
EXECUTE FUNCTION prevent_following_self();

-----------------------------------------
-- TRANSACTIONS
-----------------------------------------

-- BEGIN TRANSACTION;
-- SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- -- Insert the new comment
-- INSERT INTO Comment (content, id_post, id_user, created_at)
-- VALUES ($content, $id_post, $id_user, NOW());
-- -- Capture the id of the new comment S
-- ELECT currval('comment_id_seq') INTO $new_comment_id;
-- -- Identify the post owner
-- SELECT id_user INTO $post_owner
-- FROM Post
-- WHERE id = $id_post;
-- -- Notify the post owner about the new comment
-- INSERT INTO Notification (type, idNewComment, id_receiver, timestamp, read)
-- VALUES ('CommentNotification', $new_comment_id, $post_owner, NOW(), False);
-- END TRANSACTION;

-- BEGIN TRANSACTION;
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- -- Insert the new post
-- INSERT INTO Post (text, visibility, picture, id_user)
-- VALUES ($text, $visibility, $picture, $id_user);
-- -- Capture the id of the new post
-- SELECT currval('post_id_seq') INTO $new_post_id;
-- -- Generate notifications for all followers
-- INSERT INTO Notification (type, idNewPost, id_receiver)
-- SELECT 'NewPost', $new_post_id, Follow.id_sender
-- FROM Follow WHERE Follow.id_receiver = $id_user;
-- END TRANSACTION;

-- BEGIN TRANSACTION;
-- SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- -- Insert the new friend request
-- INSERT INTO Friendrequest (FriendRequestState, timestamp, idFollower, idFollowed)
-- VALUES ('Pending', NOW(), $idFollower, $idFollowed);
-- -- Notify the recipient about the new friend request
-- INSERT INTO Notification (type, idFriendRequest, id_receiver, timestamp, read)
-- SELECT 'FriendRequestNotification', currval('friendrequest_id_seq'), $idFollowed, NOW(), False;
-- END TRANSACTION;

-- BEGIN TRANSACTION;
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- -- Insert new follower relationship
-- INSERT INTO Follow (id_sender, id_receiver)
-- VALUES ($idFollower, $idFollowed);
-- -- Notify the followed user
-- INSERT INTO Notification (type, idNewFollow, id_receiver, timestamp, read)
-- VALUES ('NewFollower', $idFollower, $idFollowed, NOW(), False);
-- END TRANSACTION;

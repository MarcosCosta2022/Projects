
DROP SCHEMA IF EXISTS lbaw2325 CASCADE;
CREATE SCHEMA IF NOT EXISTS lbaw2325;
SET search_path TO lbaw2325;

SET DateStyle TO European;

-- Drop triggers

-- Drop trigger for BR02
DROP TRIGGER IF EXISTS prevent_duplicate_follow_request_and_request_to_self_trigger ON followrequest CASCADE;

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
DROP FUNCTION IF EXISTS prevent_duplicate_follow_request CASCADE;

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

-- Drop type followstate
DROP TYPE IF EXISTS followstate CASCADE;

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


DROP TABLE IF EXISTS password_reset_tokens CASCADE;
-----------------------------------------
-- Types
-----------------------------------------

CREATE TYPE reactiontype AS ENUM('ReactionComment', 'ReactionPost');
CREATE TYPE notificationtype AS ENUM('CommentNotification', 'FollowRequestNotification', 'LikedPost', 'NewFollower');
CREATE TYPE followrequeststate AS ENUM('Accepted', 'Refused', 'Pending', 'Public');
CREATE TYPE profilestate AS ENUM('public', 'private', 'blocked');



-----------------------------------------
-- Tables
-----------------------------------------

-- Note that a plural 'users' name was adopted because user is a reserved word in PostgreSQL.

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255),
    created_at TIMESTAMP NULL
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
   profilestate TEXT NOT NULL DEFAULT 'public'
);

CREATE TABLE profile (
   id SERIAL PRIMARY KEY,
   bio TEXT,
   birthdate DATE,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_user INT REFERENCES users(id) ON UPDATE CASCADE
);

-- Note that a plural 'groups' name was adopted because group is a reserved word in PostgreSQL.

CREATE TABLE groups (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   description TEXT,
   picture TEXT
);

CREATE TABLE post (
   id SERIAL PRIMARY KEY,
   id_user INT REFERENCES users(id) ON UPDATE CASCADE,
   content TEXT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   visibility DATE ,
   picture TEXT,
   group_id INTEGER DEFAULT NULL REFERENCES groups(id) ON UPDATE CASCADE -- if null then user didnt post in a group
);

CREATE TABLE report (
   id SERIAL PRIMARY KEY,
   content TEXT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_post INT REFERENCES post(id) ON UPDATE CASCADE,
   id_user INT REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE comment (
   id SERIAL PRIMARY KEY,
   content TEXT,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_user INT REFERENCES users(id) ON UPDATE CASCADE,
   id_post INT NOT NULL REFERENCES post(id) ON UPDATE CASCADE
);


CREATE TABLE groupmember (
   id_group INT NOT NULL REFERENCES groups(id) ON UPDATE CASCADE,
   id_user INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   isgroupadmin BOOLEAN NOT NULL,
   PRIMARY KEY (id_user, id_group)
);

CREATE TABLE follow (
   followstate TEXT NOT NULL DEFAULT 'pending' CHECK (followstate IN ('pending' , 'accepted' , 'rejected' , 'public')),
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   id_follower INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   id_followed INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
   PRIMARY KEY (id_followed,id_follower)
);


CREATE TABLE reaction (
   id SERIAL PRIMARY KEY,
   liked BOOLEAN NOT NULL,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   reactiontype TEXT,
   id_post INT REFERENCES post(id) ON UPDATE CASCADE ON DELETE CASCADE,
   id_comment INT REFERENCES comment(id) ON UPDATE CASCADE ON DELETE CASCADE,
   id_user INT REFERENCES users(id) ON UPDATE CASCADE,
   CHECK (
        (reactiontype = 'ReactionComment' AND id_comment IS NOT NULL AND id_post IS NULL) OR
        (reactiontype = 'ReactionPost' AND id_post IS NOT NULL AND id_comment IS NULL)
   )
);


CREATE TABLE notification (
   id SERIAL PRIMARY KEY,
   created_at TIMESTAMP NOT NULL CHECK (created_at <= now()),
   notificationtype TEXT CHECK (notificationtype IN ('CommentNotification', 'LikedPost', 'NewFollower')),
   read BOOLEAN NOT NULL DEFAULT FALSE,
   id_reaction INT  REFERENCES reaction(id) ON UPDATE CASCADE ON DELETE CASCADE,
   id_comment INT  REFERENCES comment(id) ON UPDATE CASCADE ON DELETE CASCADE,
   id_user INT REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
   id_follower INT ,
   CONSTRAINT followReference FOREIGN KEY (id_follower,id_user) REFERENCES follow(id_follower,id_followed) ON UPDATE CASCADE ON DELETE CASCADE,
   CHECK (
        (notificationtype = 'CommentNotification' AND id_comment IS NOT NULL) OR
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

CREATE INDEX owner_id_post ON post USING hash (id_user);

CREATE INDEX owner_id_comment ON comment USING hash (id_user);

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
CREATE OR REPLACE FUNCTION prevent_duplicate_follow_request_and_request_to_self()
RETURNS TRIGGER AS $$ 
BEGIN
    -- Check if a followship already exists in either direction
    IF EXISTS (
        SELECT 1
        FROM follow f
        WHERE (f.id_follower = NEW.id_follower AND f.id_followed = NEW.id_followed)
    ) THEN
        RAISE EXCEPTION 'Followship already exists, follow request not allowed';
    END IF;

    IF NEW.id_follower = NEW.id_followed THEN
        RAISE EXCEPTION 'You cannot send a follow request to yourself.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your follow requests table
CREATE TRIGGER prevent_duplicate_follow_request_and_request_to_self_trigger
BEFORE INSERT ON follow
FOR EACH ROW 
EXECUTE FUNCTION prevent_duplicate_follow_request_and_request_to_self();

-- for BR07

-- A user can only like or dislike posts from public users or users they are following
CREATE OR REPLACE FUNCTION prevent_invalid_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is allowed to like the post
    IF NEW.id_post IS NOT NULL AND NEW.reactiontype = 'post' AND NOT EXISTS (
        SELECT 1
        FROM lbaw2325.post p
        WHERE p.id = NEW.id_post AND (
            p.id_user = NEW.id_user -- The user is the owner of the post
            OR
            (p.id_user <> NEW.id_user AND 
                EXISTS (
                    SELECT 1
                    FROM lbaw2325.users u
                    WHERE (u.id = p.id_user AND u.profilestate = 'public')
                )
            ) -- The user is liking a post from a public profile
            OR
            EXISTS (
                SELECT 1
                FROM lbaw2325.follow f
                WHERE (
                    (f.id_follower = NEW.id_user AND f.id_followed = p.id_user AND f.followstate = 'accepted')
                    OR
                    (f.id_follower = p.id_user AND f.id_followed = NEW.id_user AND f.followstate = 'accepted')
                )
            ) -- The user is following the owner of the post
        )
    ) THEN
        RAISE EXCEPTION 'Invalid post like, like not allowed';
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
    -- Check if the user is trying to comment on a post made by a public user or a followed user
    IF NOT EXISTS (
        SELECT 1
        FROM post p
        WHERE p.id = NEW.id_post
        AND (
            p.id_user = NULL OR -- the owner of the post was removed
            p.id_user = NEW.id_user -- The user is the owner of the post
            OR EXISTS (
                SELECT 1
                FROM users u
                WHERE (u.id = p.id_user AND u.profilestate = 'public')
            )-- The user is commenting on a post from a public profile
            OR
            EXISTS (
                SELECT 1
                FROM follow f
                WHERE (
                    (f.id_follower = NEW.id_user AND f.id_followed = p.id_user AND f.followstate = 'accepted')
                    OR
                    (f.id_follower = p.id_user AND f.id_followed = NEW.id_user AND f.followstate = 'accepted')
                )
            ) -- The user follows the owner of the post
            OR 
            (p.group_id <> NULL AND EXISTS(
                SELECT 1
                FROM groups g JOIN groupMember gm ON g.id = gm.id_group
                WHERE ( 
                    gm.id_user = NEW.id_user AND
                    p.group_id = g.id
                )
            ))
        )
    ) THEN
        RAISE EXCEPTION 'You can only comment on posts from public profiles or follows, or posts in  groups you are a part of.';
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
        FROM lbaw2325.reaction r
        WHERE r.id_user = NEW.id_user AND r.id_comment = NEW.id_comment
    ) THEN
        RAISE EXCEPTION 'Reaction already exists, reaction not allowed';
    END IF;

    IF NEW.reactiontype = 'post' AND EXISTS(
        SELECT 1
        FROM lbaw2325.reaction r
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
-- -- Insert the new follow request
-- INSERT INTO Followrequest (FollowRequestState, timestamp, idFollower, idFollowed)
-- VALUES ('Pending', NOW(), $idFollower, $idFollowed);
-- -- Notify the recipient about the new follow request
-- INSERT INTO Notification (type, idFollowRequest, id_receiver, timestamp, read)
-- SELECT 'FollowRequestNotification', currval('followrequest_id_seq'), $idFollowed, NOW(), False;
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



SET DateStyle TO European;



-- Insert sample data into the 'users' table
INSERT INTO users (first_name, last_name, username, email, password, img, is_admin, profilestate)
VALUES
    ('admin', 'admin', 'admin', 'admin@example.com' , '$2y$10$2MFSMlnbeqsJyfhT48U0q.Yx6JO42V4KrDajA5/5pmw5XYbIP6P9O' , NULL , TRUE, 'public'),
    ('Ella', 'Johnson', 'ellaj', 'ella@example.com', 'password789', NULL, FALSE, 'public'),
    ('James', 'Smith', 'jamess', 'james@example.com', '$2y$10$2MFSMlnbeqsJyfhT48U0q.Yx6JO42V4KrDajA5/5pmw5XYbIP6P9O', NULL, FALSE, 'public'),
    ('Mary', 'Brown', 'maryb', 'mary@example.com', 'password456', NULL, FALSE, 'public'),
    ('David', 'Wilson', 'davidw', 'david@example.com', 'password789', NULL, FALSE, 'public'),
    ('Linda', 'Lee', 'lindal', 'linda@example.com', 'pass123', NULL, FALSE, 'public'),
    ('Michael', 'Miller', 'michaelm', 'michael@example.com', 'password456', NULL, FALSE, 'public'),
    ('Sophia', 'Moore', 'sophiam', 'sophia@example.com', 'password123', NULL, FALSE, 'public'),
    ('Daniel', 'Johnson', 'danielj', 'daniel@example.com', 'pass123', NULL , FALSE, 'public'),
    ('Ava', 'Davis', 'avad', 'ava@example.com', 'password456', NULL , FALSE, 'public'),
    ('William', 'Brown', 'williamw', 'william@example.com', 'password789', NULL, FALSE, 'public');
    

-- Insert sample data into the 'profile' table
INSERT INTO profile (bio, birthdate, created_at,id_user)
VALUES
    ('Food lover and chef', '1983-2-23', NOW(),1),
    ('Bookworm and writer', '1983-2-23', NOW(),2),
    ('Photography enthusiast', '1983-2-23', NOW(),3),
    ('Film critic', '1983-2-23', NOW(),4),
    ('Gamer', '1983-2-23', NOW(),5),
    ('Musician', '1983-2-23', NOW(),6),
    ('Traveler and Adventurer', '1983-2-23', NOW(),7),
    ('Fitness Freak', '1983-2-23', NOW(),8),
    ('Nature Lover and Environmentalist', '1983-2-23', NOW(),9),
    ('Tech Geek and Programmer', '1983-2-23', NOW(),10),
    ('Art and Design Enthusiast', '1983-2-23', NOW(),11);

-- Insert sample data into the 'group' table
INSERT INTO groups (name, description, picture)
VALUES
    ('Foodies Club', 'Share your love for food', '9XJLL2HHF6OIScE9jNvXiImrCYQG9zWWrJJN5gRD.png'),
    ('Bookworms', 'For book enthusiasts', NULL),
    ('Photography Lovers', 'Capture the world in a frame', 'ELiz90UwTSndSARwukVLcoKdN45GJbQAgdHsUv1v.jpg'),
    ('Movie Buffs', 'Discuss your favorite films', NULL),
    ('Gaming Community', 'Level up together', '0IsZgszguQ1Dx89zq0k9WfPeKXYyLIbK78AGr8Th.jpg'),
    ('Music Fans', 'Let the music play', NULL);

-- Insert sample data into the 'groupMember' table
INSERT INTO groupmember (id_group, id_user, isgroupadmin)
VALUES
    (5, 1, TRUE),
    (5, 2, FALSE),
    (6, 3, TRUE),
    (6, 4, FALSE),
    (1, 5, TRUE),
    (2, 6, FALSE),
    (2, 7, TRUE),
    (2, 8, FALSE),
    (3, 9, TRUE),
    (4, 10, FALSE);


-- Insert sample data into the 'post' table
INSERT INTO post (id_user, content, created_at, visibility, picture, group_id)
VALUES
    (1, 'Another post by John', NOW(), '2023-04-20', 'kMRqF4FfXEBr2s2OBt74r5n8eeSDDH9auIxkImJ2.jpg', 5),
    (2, 'A new post from Alice', NOW(), '2024-04-20', NULL, NULL),
    (3, 'Ella''s first post', NOW(), '2023-04-20', 'SmWA82Pv3vqeWl8NZnDaWYMnIdBa2Q2bNrogkyO0.jpg', NULL),
    (4, 'James is sharing a photo', NOW(), '2024-04-20', 'JwZFpxCHjPuq9z32gTITeedq7YSsgTJR2CQS7WkH.jpg', NULL),
    (5, 'Mary is on board', NOW(), '2024-04-20', NULL, NULL),
    (6, 'David''s post about coding', NOW(), '2024-04-20', NULL, 2),
    (7, 'Linda''s travel adventures', NOW(), '2024-04-20', 'bjRjFCmIQ5JEz5BPFowTkNRjBE2S9KTKH64JraV5.jpg', NULL),
    (8, 'Michael''s fitness journey', NOW(), '2024-04-20', NULL, NULL),
    (9, 'Sophia''s new painting', NOW(), '2024-04-20', 'vhiMQiwvwC3wkQJr4DWz9V29ipBSWa5IkdN1CdhY.jpg', NULL),
    (10, 'Daniel''s tech update', NOW(), '2024-04-20', 'tMtuU1bRbwlvbH1nzWdIkiGKFZsAZaohuNkozFjH.jpg', NULL);

-- Insert sample data into the 'comment' table
INSERT INTO comment (content, created_at, id_user, id_post)
VALUES
    ('Great to see you here, Ella!', NOW(), 3, 10),
    ('Nice picture, James.', NOW(), 4, 6),
    ('Keep sharing, Mary!', NOW(), 5, 5),
    ('David, you code like a pro!', NOW(), 1, 8),
    ('Linda, which place is this?', NOW(), 3, 7),
    ('Michael, your workout inspires!', NOW(), 4, 9),
    ('Sophia, amazing artwork!', NOW(), 5, 9),
    ('Daniel, what tech is this?', NOW(), 4, 10),
    ('Ava, your posts are delightful!', NOW(), 5, 6),
    ('William, share more with us!', NOW(), 3, 8);


-- Insert sample data into the 'follow' table
INSERT INTO follow (followstate, created_at, id_follower, id_followed)
VALUES
    ('accepted', NOW(), 6, 7),
    ('accepted', NOW(), 5, 10),
    ('accepted', NOW(), 2, 8),
    ('accepted', NOW(), 1, 4),
    ('accepted', NOW(), 3, 9),
    ('accepted', NOW(), 10, 5),
    ('accepted', NOW(), 7, 3),
    ('accepted', NOW(), 8, 6),
    ('accepted', NOW(), 4, 1),
    ('accepted', NOW(), 9, 2);


-- Insert sample data into the 'reaction' table
INSERT INTO reaction (liked, created_at, reactiontype, id_post, id_comment, id_user)
VALUES
    (TRUE, NOW(), 'ReactionComment', NULL, 6, 1),
    (TRUE, NOW(), 'ReactionPost', 9, NULL, 3),
    (TRUE, NOW(), 'ReactionComment', NULL, 4, 4),
    (TRUE, NOW(), 'ReactionPost', 5, NULL, 5),
    (TRUE, NOW(), 'ReactionComment', NULL, 8, 6),
    (TRUE, NOW(), 'ReactionPost', 10, NULL, 7),
    (TRUE, NOW(), 'ReactionComment', NULL, 10, 8),
    (TRUE, NOW(), 'ReactionPost', 7, NULL, 9),
    (TRUE, NOW(), 'ReactionComment', NULL, 2, 10),
    (TRUE, NOW(), 'ReactionPost', 1, NULL, 2);


-- Inserting a LikedPost notification
INSERT INTO notification (created_at, notificationtype, id_reaction, id_user)
VALUES
    (NOW(), 'LikedPost', 1, 2);

-- Inserting a CommentNotification
INSERT INTO notification ( created_at, notificationtype, id_comment, id_user)
VALUES
    ( NOW(), 'CommentNotification', 3, 4);

-- Inserting a NewFollower notification
INSERT INTO notification ( created_at, notificationtype, id_follower, id_user)
VALUES
    ( NOW(), 'NewFollower', 6, 7);

-- Inserting a LikedPost notification with a read status
INSERT INTO notification ( created_at, notificationtype, id_reaction, id_user, read)
VALUES
    ( NOW(), 'LikedPost', 9, 10, TRUE);        
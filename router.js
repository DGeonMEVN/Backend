const bcrypt = require("bcrypt");
const {isNotLoggedIn} = require("./routes/middlewares");
const {authenticate} = require("passport");
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); // CORS 허용 설정
module.exports = function(app, User, Board) {
    app.get('/', (req,res) =>{
    });
    app.post('/signup', async function(req, res) {
        try {
            const user = new User();
            user.userId = req.body.userId;
            user.userPw = bcrypt.hashSync(req.body.userPw, 10);
            //bcrypt를 암호를 해독할때 const result = bcrypt.compareSync(입력값, DB에 저장된 값);
            user.userName = req.body.userName;
            user.gender = req.body.gender;

            await user.save();
            res.json({ message: 'Signup Success!' });
        } catch (err) {
            console.error(err);
            res.json({ message: 'Signup failed!!' });
        }
    });

    app.get('/find/:userId', async function(req, res){
        try {
            const user = await User.findOne({userId: req.params.userId});
            if(!user) return res.status(404).json({error: 'the userID does not exist.'});
            res.json(user);
        }catch (err){
            if(err) return res.status(500).json({error: err});
        }
    });

    app.get('/findlist', async function(req, res) {
        try {
            const users = await User.find({});
            if (users.length === 0) {
                return res.status(404).json({ error: 'the userID does not exist.' });
            }
            res.json(users);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });

    app.put('/update/:userId', async function(req, res){
        try{
            const userInfo = await User.findOne({userId: req.params.userId});
            const user = await User.findByIdAndUpdate(userInfo.id, {userPw : req.body.userPw});
            if (!user){
                return res.status(404).json({error : 'the userID does not exist.' })
            }
            await user.save();
            res.json('Update Complete.');
        }catch (err){
            return res.status(500).json({error:err.message});
        }
    });

    app.delete('/remove', async function(req, res){
        try{
            const userInfo = await User.findOne({userId: req.body.userId});
            // res.json(userInfo);
            const result = await User.deleteOne({_id:userInfo.id});
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'The userID does not exist.' });
            }
            res.json('Delete User Complete');
        }catch (err){
            return res.status(500).json({error:err.message});
        }
    });

    // app.post('/login', async  function(req,res){
    //     try{
    //         res.json({ message: 'login' });
    //     }catch (err){
    //         console.error(err);
    //         res.json({ message: 'Board failed!!' });
    //     }
    // })
    // app.post('/login', isNotLoggedIn, async (req, res, next) => {
    //     authenticate('local', async (authError, user, info) => {
    //         if (authError) {
    //             console.error(authError);
    //             return next(authError);
    //         }
    //
    //         if (!user) {
    //             return res.redirect(`/?loginError=${info.message}`);
    //         }
    //
    //         try {
    //             await req.login(user, async loginError => {
    //                 if (loginError) {
    //                     console.error(loginError);
    //                     return next(loginError);
    //                 }
    //                 return res.redirect('/');
    //             });
    //         } catch (error) {
    //             console.error(error);
    //             return next(error);
    //         }
    //     })(req, res, next);
    // });

    app.post('/board/write', async function(req, res) {
        try {
            const board = new Board();
            board.title = req.body.title;
            board.content = req.body.content;
            // board.writer = await User.findOne({userId : req.params.userId});
            board.writer = req.body.writer;
            board.save();

            res.json({ message: 'Board Success!' });
        } catch (err) {
            console.error(err);
            res.json({ message: 'Board failed!!' });
        }
    });

}

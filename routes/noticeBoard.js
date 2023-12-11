const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const NoticeBoard = require('../models/NoticeBoard');
const { Counters } = require('../models/Counters');
const Board = require("../models/NoticeBoard");
const authJWT = require("../utils/authJWT");
const User = require("../models/user");

const initializeSequence = async (sequenceName) => {
    try {
        const existingSequence = await Counters.findById(sequenceName);

        if (!existingSequence) {
            await Counters.create({
                _id: sequenceName,
                sequence_value: 0,
            });
        }
    } catch (error) {
        console.error('Error initializing sequence:', error);
        throw error;
    }
};

const getNextSequenceValue = async (sequenceName) => {
    try {
        const sequenceDocument = await Counters.findOneAndUpdate(
            { _id: sequenceName },
            { $inc: { sequence_value: 1 } },
            { new: true }
        );
        if (!sequenceDocument) {
            throw new Error('Sequence document not found.');
        }
        return sequenceDocument.sequence_value;
    } catch (error) {
        console.error('Error getting next sequence value:', error);
        throw error;
    }
};

router.post("/white", async (req, res, next) => {
    try {
        await initializeSequence('MedisonDiaryBoard'); // 시퀀스 초기화
        const sequenceValue = await getNextSequenceValue('MedisonDiaryBoard');
        const board = new NoticeBoard();
        board.userId = req.body.userId;
        board.title = req.body.title;
        board.content = req.body.content;
        board.bno = sequenceValue; // AutoIncrement로 생성된 필드에 할당
        await board.save();
        res.status(200).send({ ok: true });
    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});

router.get('/:pageNum', async (req,res,next)=>{
    try{
        console.log("리스트 요청")
        const pageNum = req.params.pageNum || 1;
        const pageSize = 3;
        const mongoSkip = (pageNum - 1) * pageSize;

        const boards = await NoticeBoard.find({})
            .sort({"bno" : -1})
            .skip(mongoSkip)
            .limit(pageSize);
        const boardCount = await NoticeBoard.count();
        const pageCount = boardCount/pageSize;
        res.status(200).send({ ok : true, boards : boards, pageCount : pageCount });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


router.get("/noticeView/:bno", async (req,res,next)=>{
    try {
        console.log(req.params.bno);
        const Board = await NoticeBoard.findOne({bno : req.params.bno})
        console.log(Board)
        res.status(200).json({ ok : true, Board : Board});
    }
    catch (err){
        res.status(400).json({ok:false, message : "failed!!"})
    }
})

router.get("/noticeUpdate/:bno", async (req,res,next)=>{
    try {
        console.log(req.params.bno);
        const Board = await NoticeBoard.findOne({bno : req.params.bno})
        console.log(Board)
        res.status(200).json({ ok : true, Board : Board});
    }
    catch (err){
        res.status(400).json({ok:false, message : "failed!!"})
    }
})

router.put("/update", async (req, res, next) => {
    try {
        await Board.updateOne(
            {bno : req.body.bno},
            {
                $set:
                    {
                        title : req.body.title,
                        content : req.body.content,
                        updateDate: Date.now()
                    }
            })
        res.status(200).send({ ok: true });
    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});

router.delete("/delete", async (req, res, next) => {
    try {
        const user = await User.findOne({userId : req.body.userId})
        const board = await Board.findOne( { bno : req.body.bno});
        if(user.userId === board.userId){
            await board.deleteOne({bno : board.bno});
            res.status(200).send({ ok: true });
        }else{
            res.status(400).send({ ok: false });
        }

    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});

module.exports = router;
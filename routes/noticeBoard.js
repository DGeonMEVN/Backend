const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const NoticeBoard = require('../models/NoticeBoard');
const { Counters } = require('../models/Counters');

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
        console.error('Error in post /white:', err);
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});

router.get('/', async (req,res,next)=>{
    try{
        console.log("리스트 요청")
        const boards = await NoticeBoard.find({});
        res.json(boards);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get("/noticeView/:bno", async (req,res,next)=>{
    try {
        console.log(req.params.bno);
    }
    catch (err){

    }
})

module.exports = router;
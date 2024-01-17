const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const NoticeBoard = require('../models/NoticeBoard');
const { Counters } = require('../models/Counters');
const Board = require("../models/NoticeBoard");
const authJWT = require("../utils/authJWT");
const User = require("../models/user");

/**
 * @author ovmkas
 * @created  2023-12-06
 * @description 공지사항 글번호를 위한 시퀀스 생성 컴포넌트
 */
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

/**
 * @author ovmkas
 * @created  2023-12-06
 * @description 공지사항 마지막 글번호를 불러오기 위한 컴포넌트
 */
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

/**
 * @author ovmkas
 * @created  2023-12-06
 * @description 공지사항 작성 컴포넌트
 * @modified 2023-12-14
 * @modification Token 검증 작업 추가
 */
router.post("/white", authJWT, async (req, res, next) => {
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

/**
 * @author ovmkas
 * @created  2023-12-11
 * @description 공지사항 리스트 출력 
 */
router.get('/:pageNum', async (req,res,next)=>{
    try{
        console.log("리스트 요청")
        const pageNum = req.params.pageNum || 1;
        const pageSize = 3; //페이지 출력 갯수
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

/**
 * @author ovmkas
 * @created  2023-12-06
 * @description 공지사항 글 상세 보기
 */
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

/**
 * @author ovmkas
 * @created  2023-12-07
 * @description 공지사항 글 수정(파라미터)
 */
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

/**
 * @author ovmkas
 * @created  2023-12-07
 * @description 공지사항 글 수정(객체)
 * @modified 2024-01-11
 * @modification Token 검증 작업 추가
 */
router.put("/update", authJWT, async (req, res, next) => {
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

/**
 * @author ovmkas
 * @created  2023-12-08
 * @description 공지사항 글 삭제
 * @modified 2024-01-11
 * @modification Token 검증 작업 추가
 */
router.delete("/delete", authJWT, async (req, res, next) => {
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


/**
 * @author ovmkas
 * @created  2023-12-14
 * @description 공지사항 검색(글제목, 글작성자, 글내용)
 */
router.post("/search", async (req, res, next) => {
    try {
        console.log("search 넘어온 데이터 " , req.body);
        let pageNum = req.body.pageNum || 1;
        let pageSize = 3;
        let mongoSkip = (pageNum - 1) * pageSize;

        let keyword = req.body.search;
        let query = {};
        const orConditions = [];

        if (req.body.titleCheck) {
            orConditions.push({ title: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.contentCheck) {
            orConditions.push({ content: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.userCheck) {
            orConditions.push({ userId: { $regex: new RegExp(keyword, "i") } });
        }
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        console.log("query", query)
        let boards = await NoticeBoard.find(query)
            .sort({"bno" : -1})
            .skip(mongoSkip)
            .limit(pageSize);
        let boardCount = await NoticeBoard.count(query);
        let pageCount = Math.round(boardCount/pageSize);
        if(pageCount===0){
            pageCount=1;
        }
        console.log("boardCount", boardCount)
        console.log("pageSize", pageSize)
        console.log("pageCount", pageCount)
        res.status(200).send({ ok : true, boards : boards, pageCount : pageCount });

    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});


module.exports = router;
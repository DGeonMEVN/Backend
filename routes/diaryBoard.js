const express = require('express');
const router = express.Router();
const DiaryBoard = require('../models/diaryBoard');
const { diaryCounters } = require("../models/diaryCounters");
const authJWT = require("../utils/authJWT");
const User = require("../models/user");

/**
 * @author ovmkas
 * @created  2024-01-18
 * @description 일지 글번호를 위한 시퀀스 생성 컴포넌트
 */
const initializeSequence = async (sequenceName) => {
    try {
        const existingSequence = await diaryCounters.findById(sequenceName);

        if (!existingSequence) {
            await diaryCounters.create({
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
 * @created  2024-01-18
 * @description 일지 마지막 글번호를 불러오기 위한 컴포넌트
 */
const getNextSequenceValue = async (sequenceName) => {
    try {
        const sequenceDocument = await diaryCounters.findOneAndUpdate(
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
 * @created  2024-01-18
 * @description 일지 작성 컴포넌트
 */
router.post("/white", authJWT, async (req, res, next) => {
    try {
        await initializeSequence('MedisonDiaryDiaryBoard'); // 시퀀스 초기화
        const sequenceValue = await getNextSequenceValue('MedisonDiaryDiaryBoard');
        console.log("다이어리성공");
        const diaryBoard = new DiaryBoard();
        diaryBoard.userId = req.body.userId;
        diaryBoard.systolic = req.body.systolic;
        diaryBoard.diastolic = req.body.diastolic;
        diaryBoard.pulse = req.body.pulse;
        diaryBoard.taking = req.body.taking;
        diaryBoard.significant = req.body.significant;
        diaryBoard.weight = req.body.weight;
        diaryBoard.bno = sequenceValue;
        await diaryBoard.save();
        res.status(200).send({ ok: true });
    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});

/**
 * @author ovmkas
 * @created  2024-01-19
 * @description 일지 리스트 출력
 */
router.get('/:pageNum', async (req,res,next)=>{
    try{
        // console.log("리스트 요청")
        const pageNum = req.params.pageNum || 1;
        const pageSize = 3; //페이지 출력 갯수
        const mongoSkip = (pageNum - 1) * pageSize;

        const boards = await DiaryBoard.find({})
            .sort({"bno" : -1})
            .skip(mongoSkip)
            .limit(pageSize);
        const boardCount = await DiaryBoard.count();
        const pageCount = boardCount/pageSize;
        res.status(200).send({ ok : true, boards : boards, pageCount : pageCount });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

/**
 * @author ovmkas
 * @created  2024-01-19
 * @description 일지 검색(글제목, 글작성자, 글내용)
 */
router.post("/search", async (req, res, next) => {
    console.log("서치로 넘어옴")
    try {
        // console.log("search 넘어온 데이터 " , req.body);
        let pageNum = req.body.pageNum || 1;
        let pageSize = 3;
        let mongoSkip = (pageNum - 1) * pageSize;

        let keyword = req.body.search;
        let query = {};
        const orConditions = [];

        if (req.body.systolicCheck) {
            orConditions.push({ systolic: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.diastolicCheck) {
            orConditions.push({ diastolic: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.pulseCheck) {
            orConditions.push({ pulse: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.weightCheck) {
            orConditions.push({ weight: { $regex: new RegExp(keyword, "i") } });
        }
        if (req.body.significantCheck) {
            orConditions.push({ significant: { $regex: new RegExp(keyword, "i") } });
        }
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        // console.log("query", query)
        let diaryBoardList = await DiaryBoard.find(query)
            .sort({"bno" : -1})
            .skip(mongoSkip)
            .limit(pageSize);
        let boardCount = await DiaryBoard.count(query);
        let pageCount = Math.round(boardCount/pageSize);
        if(pageCount===0){
            pageCount=1;
        }
        // console.log("boardCount", boardCount)
        // console.log("pageSize", pageSize)
        // console.log("pageCount", pageCount)
        res.status(200).send({ ok : true, diaryBoardList : diaryBoardList, pageCount : pageCount });

    } catch (err) {
        console.error('Error stack:', err.stack); // 에러 스택 출력 추가
        res.status(400).send({ ok: false, error: err.message });
    }
});
module.exports = router;
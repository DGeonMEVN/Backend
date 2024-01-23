const express = require('express');
const router = express.Router();
const DiaryBoard = require('../models/diaryBoard');
const BloodPressure = require('../models/diaryBloodPressure');
const Takit = require('../models/diaryTake');
const Gargle = require('../models/diaryGargle');
const { diaryCounters } = require("../models/diaryCounters");
const authJWT = require("../utils/authJWT");
const User = require("../models/user");
const {Promise} = require("mongoose");

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
        const diaryBoard = new DiaryBoard();
        const bloodPressure = new BloodPressure();
        const gargle = new Gargle();
        const takit = new Takit();

        diaryBoard.userId = req.body.userId;
        diaryBoard.bno = sequenceValue;
        diaryBoard.weight = req.body.weight;
        diaryBoard.significant = req.body.significant;

        console.log("기본",diaryBoard);

        bloodPressure.userId = req.body.userId;
        bloodPressure.bno = sequenceValue;
        bloodPressure.systolic = req.body.systolic;
        bloodPressure.diastolic = req.body.diastolic;
        bloodPressure.pulse = req.body.pulse;

        console.log("혈압",bloodPressure);

        takit.userId = req.body.userId;
        takit.bno = sequenceValue;
        takit.take = req.body.take;

        console.log("복용",takit);

        gargle.userId = req.body.userId;
        gargle.bno = sequenceValue;
        gargle.gargle = req.body.gargle;

        console.log("가글", gargle);


        await diaryBoard.save();
        await bloodPressure.save();
        await takit.save();
        await gargle.save();

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
// router.post("/search", async (req, res, next) => {
//     console.log("서치로 넘어옴")
//     try {
//         // console.log("search 넘어온 데이터 " , req.body);
//         let pageNum = req.body.pageNum || 1;
//         let pageSize = 3;
//         let mongoSkip = (pageNum - 1) * pageSize;
//
//         let keyword = req.body.search;
//         let query = {};
//         const orConditions = [];
//
//         if (req.body.systolicCheck) {
//             orConditions.push({ systolic: { $regex: new RegExp(keyword, "i") } });
//         }
//         if (req.body.diastolicCheck) {
//             orConditions.push({ diastolic: { $regex: new RegExp(keyword, "i") } });
//         }
//         if (req.body.pulseCheck) {
//             orConditions.push({ pulse: { $regex: new RegExp(keyword, "i") } });
//         }
//         if (req.body.weightCheck) {
//             orConditions.push({ weight: { $regex: new RegExp(keyword, "i") } });
//         }
//         if (req.body.significantCheck) {
//             orConditions.push({ significant: { $regex: new RegExp(keyword, "i") } });
//         }
//         if (orConditions.length > 0) {
//             query.$or = orConditions;
//         }
//         // console.log("query", query)
//         let diaryBoardList =
//             await DiaryBoard.find(query)
//             .sort({"bno" : -1})
//             .skip(mongoSkip)
//             .limit(pageSize);
//
//         console.log(diaryBoardList);
//
//         let boardCount = await DiaryBoard.count(query);
//         let pageCount = Math.round(boardCount/pageSize);
//         if(pageCount===0){
//             pageCount=1;
//         }
//         // console.log("boardCount", boardCount)
//         // console.log("pageSize", pageSize)
//         // console.log("pageCount", pageCount)
//         res.status(200).send({ ok : true, diaryBoardList : diaryBoardList, pageCount : pageCount });
//
//     } catch (err) {
//         console.error('Error stack:', err.stack); // 에러 스택 출력 추가
//         res.status(400).send({ ok: false, error: err.message });
//     }
// });

router.post("/search", async (req, res, next) => {
    console.log("서치로 넘어옴")
    try {
        let pageNum = req.body.pageNum || 1;
        let pageSize = 3;
        let mongoSkip = (pageNum - 1) * pageSize;

        let keyword = req.body.search;
        let query = {};
        const orConditions = [];

        // 검색할 각 필드에 대한 조건을 확인하고 추가합니다.
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

        // $lookup을 사용하여 테이블을 조인합니다.
        let diaryBoardList = await DiaryBoard.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "MedisonDiary_diaryBloodPressure",
                    localField: "bno",
                    foreignField: "bno",
                    as: "bloodPressure"
                }
            },
            {
                $lookup: {
                    from: "MedisonDiary_diaryTakit",
                    localField: "bno",
                    foreignField: "bno",
                    as: "take"
                }
            },
            {
                $lookup: {
                    from: "MedisonDiary_diaryGargle",
                    localField: "bno",
                    foreignField: "bno",
                    as: "gargle"
                }
            },
            {
                $sort: { "bno": -1 }
            },
            {
                $skip: mongoSkip
            },
            {
                $limit: pageSize
            }
        ]);

        let boardCount = await DiaryBoard.count(query);
        let pageCount = Math.round(boardCount / pageSize);
        if (pageCount === 0) {
            pageCount = 1;
        }

        res.status(200).send({ ok: true, diaryBoardList: diaryBoardList, pageCount: pageCount });

    } catch (err) {
        console.error('Error stack:', err.stack);
        res.status(400).send({ ok: false, error: err.message });
    }
});

/**
 * @author ovmkas
 * @created  2023-01-23
 * @description 일지 글 상세 보기
 */
router.post("/diaryView", async (req,res,next)=>{
    try {
        console.log("diaryView")
        console.log(req.body.bno);
        console.log(req.body.userId);
        // console.log(req.params.bno);
        const Board = await DiaryBoard.findOne({bno: req.body.bno, userId : req.body.userId})
        const Gargles = await Gargle.find({bno : req.body.bno, userId : req.body.userId})
        const BloodPressures = await BloodPressure.find({bno : req.body.bno, userId : req.body.userId})
        const Takes = await Takit.find({bno : req.body.bno});

        res.status(200).send({ok: true, Board: Board,  Gargle :Gargles, BloodPressure : BloodPressures, Take : Takes} );
    }
    catch (err){
        res.status(400).send({ok:false, message : "failed!!"})
    }
})

/**
 * @author ovmkas
 * @created  2023-12-07
 * @description 공지사항 글 수정(파라미터)
 */
module.exports = router;
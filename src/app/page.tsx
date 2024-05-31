"use client";

import React from "react";

import Input from "@mui/material/Input";
import Button from "@mui/material/Button";

import { useState, useEffect } from "react";

import { db } from "@/libs/firebase/firebase";

import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [keyWordForMake, setKeyWordForMake] = useState<string>("");
  const [keyWordForEnter, setKeyWordForEnter] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");

  const initializeRoom = async (roomID: string, keyWord: string) => {
    let roomData: { [key: string]: any } = {};
    const data = (await db.ref("room").get()).val();
    if (data !== null) {
      roomData = data;
    }
    // あらかじめroomがない場合もある
    if (Object.keys(roomData).length !== 0) {
      // まさかとは思うけどUUIDが重複していたら、やりなおし
      if (roomData[roomID]) {
        console.log("UUIDが重複しています");
        const nextUUID: string = uuidv4();
        await initializeRoom(nextUUID, keyWord);
      }

      // あいことば(keyWord)が重複していたら、やりなおし
      for (const key in roomData) {
        if (roomData[key].keyWord === keyWord) {
          console.log("あいことばが重複しています");
          return "error1";
        }
      }
    }

    const nowDate: string = new Date().toString();

    // 重複がなければ、部屋を作成
    roomData[roomID] = {
      createdAt: nowDate, // 作成日(一週間たったら消すよう)
      keyWord: keyWord, // 入る用のあいことば
      // users: [], // からはついか出来ないよ～
      isAdminCreated: false, // 初期アクセスでtrueにする
    }

    await db.ref("room").set(roomData);
    return "success";
  }


  const createNewRoomHandler = async () => {
    const roomID: string = uuidv4();
    // await initializeRoom(roomID, keyWord);
    const result: string = await initializeRoom(roomID, keyWordForMake);
    if (result === "error1") {
      alert("あいことばはすでに存在するので変えてください");
      setErrorMessage("あいことばが重複しています");
      return;
    } else if (result === "success") {
      // 作成した部屋に遷移
      window.location.href = `/${roomID}`;
    }
  }

  const searchRoomByKeyWord = async (word: string) => {
    const dataFromFB = await db.ref("room").get();
    const data = dataFromFB.val();

    for (const key in data) {
      if (data[key].keyWord === word) {
        // 部屋に遷移
        return { status: "success", roomID: key };
      }
    }

    // 部屋が見つからなかった場合
    alert("部屋が見つかりませんでした");
    setErrorMessage("部屋が見つかりませんでした");
    return { status: "error", roomID: "" };
  }

  const enterExistingRoomHandler = async () => {
    // あいことばが正しいかどうかを確認
    // 正しければ部屋に遷移
    // 間違っていればエラーメッセージを表示
    type resultType = {
      status: string,
      roomID: string
    }

    const result: resultType = await searchRoomByKeyWord(keyWordForEnter);
    if (result.status === "success" && result.roomID !== "") {
      window.location.href = `/${result.roomID}`;
    } else {
      console.log("部屋が見つかりませんでした");
      return;
    }
  }


  return (
    <div className="App">
      <h3>QuizR</h3>
      <p>かんたんクイズ共有アプリ</p>

      <h5>部屋を作る</h5>
      <p>あいことばを入力してください</p>
      <Input type="text" placeholder="あいことば" onChange={(e) => setKeyWordForMake(e.target.value)} value={keyWordForMake} />
      <Button variant="contained" color="primary" onClick={createNewRoomHandler}>作成</Button>


      <h5>部屋にはいる</h5>
      <Input type="text" placeholder="あいことば" onChange={(e) => setKeyWordForEnter(e.target.value)} value={keyWordForEnter} />
      <Button variant="contained" color="primary" onClick={enterExistingRoomHandler}>入室</Button>


    </div>
  );
}

export default App;
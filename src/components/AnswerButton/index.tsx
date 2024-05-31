"use client";

import React, { useRef } from "react";

import "./index.css";

import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

import { QRCodeCanvas } from "qrcode.react";

import { useState, useEffect } from "react";
// import firebase from "@/libs/firebase/firebase";
import { db } from "@/libs/firebase/firebase";

interface QRCodeProps {
  url: string;
}

type AnswerButtonProps = {
  roomID: string;
}

const QRCode: React.FC<QRCodeProps> = (props) => {
  return (
    <QRCodeCanvas
      value={props.url}
      size={256}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"L"}
      includeMargin={false}
      imageSettings={{
        src: "/favicon.ico",
        x: undefined,
        y: undefined,
        height: 24,
        width: 24,
        excavate: true,
      }}
    />
  );
};

const AnswerButton: React.FC<AnswerButtonProps> = (
  { roomID }
) => {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorAboutUserName, setErrorAboutUserName] = useState<string>("");
  // const [answeringUser, setAnsweringUser] = useState<string>("");

  const [role, setRole] = useState<"admin" | "user">("user");

  const [errorAboutNewImageURL, setErrorAboutNewImageURL] = useState<string>("");
  const [errorAboutAnswerInput, setErrorAboutAnswerInput] = useState<string>("");

  // const [isAbleToAnswer, setIsAbleToAnswer] = useState<boolean>(false);

  const [keyWord, setKeyWord] = useState<string>("");

  const [answerInput, setAnswerInput] = useState<string>("");

  const [userNameInput, setUserNameInput] = useState<string>("");

  const [users, setUsers] = useState<{ [key: string]: { point: number } }>({});

  // const handleClick = async () => {
  //   // console.log("ついか開始");
  //   db.ref(`room/${roomID}/user`).set(userName);
  //   // console.log("ついか完了");
  // }

  /* user > {username} : {
    point: 0,
    isAnswering: false
  }
  // すべてのユーザーの, このinAnsweringを監視する
  */

  // さらに、realtime databaseの変更を監視する
  // useEffect(() => {
  //   db.ref(`room/${roomID}/users`).on("value", (snapshot) => {
  //     const data = snapshot.val();
  //     // console.log("監視されたdata", data);
  //     // setAnsweringUser(data);
  //     // 自分と同じ名前でないなら、回答不可能
  //     // setIsAbleToAnswer(data == userName);
  //   });
  // }, []);

  useEffect(() => {
    // adminがすでにいるかどうかを確認
    const getIsAdminCreated = async () => {
      const dataFromFB = (await db.ref(`room/${roomID}/isAdminCreated`).get()).val();
      if (dataFromFB === true) {
        console.log("adminはすでにいる");
        // localStorageからadminの状態を取得
        const isAdmin = localStorage.getItem(`${roomID}_isAdmin`);
        if (isAdmin === "true") {
          console.log("あなたはすでにadminでしたね。");
          setRole("admin");
        }
        return;
      } else {
        // 初回アクセスはこっちになるはず
        console.log("adminはいないのであなたがadminになります");
        setRole("admin");
        // adminの状態をlocalStorageに保存
        localStorage.setItem(`${roomID}_isAdmin`, "true");
        await db.ref(`room/${roomID}/isAdminCreated`).set(true);
      }
    }

    getIsAdminCreated();
  }, []);

  useEffect(() => {
    // keywordを取得
    const getAnsweringUser = async () => {
      const keyWordFromDB = (await db.ref(`room/${roomID}/keyWord`).get()).val();
      setKeyWord(keyWordFromDB);
    }
    getAnsweringUser();
  }), [];

  // localstorageに保存されているユーザーネームを取得
  useEffect(() => {
    const userNameFromLS = localStorage.getItem(`${roomID}_userName`);
    if (userNameFromLS !== null) {
      setUserName(userNameFromLS);
    }
  }, []);

  // const admin_deleteAnsweringUser = async () => {
  //   // db.ref(`room/${roomID}/user`).remove();
  //   // これではroomごと消えるので、そうではなくuserのみ消す
  //   db.ref(`room/${roomID}/user`).set("");
  // }

  type userType = {
    point: number
  }

  const setUserNameFunc = async (name: string) => {
    if (name === "") {
      return "error";
    } else {
      let alreadyUsers: { [key: string]: userType } = {};
      const alreadyUsersFromDB = (await db.ref(`room/${roomID}/users`).get()).val();
      if (alreadyUsersFromDB !== null) {
        alreadyUsers = alreadyUsersFromDB;
      }

      const newUser = {
        point: 0
      }
      alreadyUsers[name] = newUser;
      await db.ref(`room/${roomID}/users`).set(alreadyUsers);
      return "success";
    }
  }


  const userNameRegisterHandler = async () => {
    if (userNameInput === "") {
      setIsModalOpen(false);
      return;
    }
    // 初回アクセスのときに、ユーザーネームを問う
    // そのあと、localStorageに保存しておく
    const result: string = await setUserNameFunc(userNameInput);
    if (result === "error") {
      setErrorAboutUserName("ユーザーネームが空です");
    } else {
      setUserName(userNameInput);
      localStorage.setItem(`${roomID}_userName`, userNameInput);
    }
    setIsModalOpen(false);
    return;
  }

  // useEffect(() => {
  //   setIsAbleToAnswer(answeringUser === userName);
  // }, [userName, answeringUser]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openConfirmationModal = async () => {
    // 一旦、モーダルで確認をする
    // もし空白なら、先にすすませない
    setIsModalOpen(true);
    if (userNameInput === "") {
      // setErrorAboutUserName("ユーザーネームが空です");
      return;
    }
    const alreadyUsersFromDB = (await db.ref(`room/${roomID}/users`).get()).val();
    if (alreadyUsersFromDB !== null) {
      if (Object.keys(alreadyUsersFromDB).includes(userNameInput)) {
        setErrorAboutUserName("すでに存在するユーザーネームですが続行しますか？(グループとしての使用になります)");
      } else {
        setErrorAboutUserName("");
      }
    }
  }

  const [newImageURLInput, setNewImageURLInput] = useState<string>("");

  const newImageURLregisterHandler = async () => {
    if (newImageURLInput === "") {
      setErrorAboutNewImageURL("URLが空です");
      return;
    }
    if (!newImageURLInput.startsWith("http")) {
      setErrorAboutNewImageURL("URLが不正です");
      return;
    }
    let imageURLs: { [key: string]: { name: string } } = {};
    // まずは既存のデータを取得
    const dataFromDB = (await db.ref("database").get()).val();
    if (dataFromDB !== null) {
      imageURLs = dataFromDB;
    }
    // すでに同じのがあったら、追加しない
    if (Object.keys(imageURLs).includes(newImageURLInput)) {
      setErrorAboutNewImageURL("すでに存在するURLです")
      return;
    }
    // base64エンコードして、キーとして使う
    const newImageURLInputEncoded = btoa(newImageURLInput);
    imageURLs[newImageURLInputEncoded] = {
      "name": "",
    }
    await db.ref("database").set(imageURLs);
    setErrorAboutNewImageURL("追加に成功しました！");
    return;
  }


  /** */
  const [imageURLs, setImageURLs] = useState<{ [key: string]: { name: string } }>({}); // 画像のURLを保持する

  const [currentProblemImageURL, setCurrentProblemImageURL] = useState<string>("");
  const [currentProblemKind, setCurrentProblemKind] = useState<"register" | "answer">("register");

  const [currentCorrectUser, setCurrentCorrectUser] = useState<string>("");
  const [currentNewName, setCurrentNewName] = useState<string>("");

  // さらに、databaseの監視もする
  // もしかしたら途中で画像が増えるかもしれない
  useEffect(() => {
    db.ref(`database`).on("value", (snapshot) => {
      const data = snapshot.val();
      setImageURLs(data);
    });
  }, []);

  useEffect(() => {
    db.ref(`room/${roomID}/currentProblemImageURL`).on("value", (snapshot) => {
      const data = snapshot.val();
      setCurrentProblemImageURL(data);
    });
  }, []);

  useEffect(() => {
    db.ref(`room/${roomID}/currentCorrectUser`).on("value", (snapshot) => {
      const data = snapshot.val();
      setCurrentCorrectUser(data);
    });
  }, []);

  useEffect(() => {
    db.ref(`room/${roomID}/currentNewName`).on("value", (snapshot) => {
      const data = snapshot.val();
      setCurrentNewName(data);
    });
  }, []);


  useEffect(() => {
    db.ref(`room/${roomID}/users`).on("value", (snapshot) => {
      const data = snapshot.val();
      setUsers(data);
    });
  }, []);



  useEffect(() => {
    if (Object.keys(imageURLs).length !== 0 && currentProblemImageURL !== "") {
      if (imageURLs[currentProblemImageURL].name === "") {
        setCurrentProblemKind("register");
      } else {
        setCurrentProblemKind("answer");
      }
    }
  }, [currentProblemImageURL]);

  // TODO: データもったいないから後で直して

  useEffect(() => {
    // inputをリセット
    setAnswerInput("");
    setErrorAboutAnswerInput("");
  }, [currentCorrectUser, currentNewName]);

  useEffect(() => {
    const setRoleByLS = async () => {
      const isAdmin = localStorage.getItem(`${roomID}_isAdmin`);
      if (isAdmin === "true") {
        setRole("admin");
      } else {
        setRole("user");
      }
    }

    setRoleByLS();
  }, []);

  const changeProblemImageHandler = async () => {
    // まず、imageURLsの中からランダムに1つ選ぶ
    const randomKey = Object.keys(imageURLs)[Math.floor(Math.random() * Object.keys(imageURLs).length)];
    // `room/${roomID}/currentProblemImageURL`を変更する
    await db.ref(`room/${roomID}/currentProblemImageURL`).set(randomKey);
    // 回答者をリセット
    await db.ref(`room/${roomID}/currentCorrectUser`).set("");
    // 新しい名前もリセット
    await db.ref(`room/${roomID}/currentNewName`).set("");
  }

  const answerButtonMainHandler = async () => {
    // 登録、または回答をする
    if (currentProblemKind === "register") {
      if (answerInput === "") {
        setErrorAboutAnswerInput("名前が空です");
        return;
      }
      // 他のキャラクターの名前と重複していないか確認
      // imageURLsにすべて入っている
      const imageURLsKeys = Object.keys(imageURLs);
      let isExist = false;
      for (const key of imageURLsKeys) {
        if (imageURLs[key].name === answerInput) {
          isExist = true;
          break;
        }
      }
      if (isExist) {
        setErrorAboutAnswerInput("すでに存在する名前です");
        return;
      }
      // なければ、登録
      imageURLs[currentProblemImageURL].name = answerInput;
      await db.ref(`database`).set(imageURLs);
      setErrorAboutAnswerInput("登録に成功しました");
      // また、この回答を、全員に通知する
      await db.ref(`room/${roomID}/currentNewName`).set(answerInput);

    } else if (currentProblemKind === "answer") {
      // こんどは回答で、リアルタイム性を重視
      // 正誤判定はクライアントでやり、正解と一致したらfirebaseにusernameを送信して、
      // 管理者側でポイントの加算処理、全員に、正解者の名前を通知する
      // (`room/${roomID}/correctUser`)を参照して、空ならばまだ回答受付中
      const correctUser = (await db.ref(`room/${roomID}/currentCorrectUser`).get()).val();
      // 空っぽなら作成
      if (correctUser === null || correctUser === "") {
        const answerByLocal = imageURLs[currentProblemImageURL].name;
        if (answerInput === answerByLocal) {
          // 正解
          const userPoint = (await db.ref(`room/${roomID}/users/${userName}/point`).get()).val();
          await db.ref(`room/${roomID}/users/${userName}/point`).set(userPoint + 1);
          // また、この回答を、全員に通知する
          setErrorAboutAnswerInput("正解です!!");

          await db.ref(`room/${roomID}/currentCorrectUser`).set(userName);
        } else {
          setErrorAboutAnswerInput("不正解です!!");
          // 不正解
        }
      } else {
        setErrorAboutAnswerInput("すでに回答が終了しています");
      }
    }
  }


  return (
    <>
      <h5>roomID</h5>
      {roomID}
      <br />

      <h5>あなたの役割</h5>
      {role === "admin" ? "管理者" : "ユーザー"}

      {role === "user" && ( // adminは名前不要
        <>
          {userName === "" && (
            <>
              <h3>ここをモーダルにする予定</h3>
              <h5>ユーザーネーム入力</h5>
              <Input type="text" value={userNameInput} onChange={(e) => setUserNameInput(e.target.value)} />

              <h5>ユーザーネームを登録</h5>
              <Button
                onClick={() => openConfirmationModal()}
                variant="contained"
              >
                登録
              </Button>
              <br />
              {isModalOpen && (
                <>
                  {errorAboutUserName !== "" ? <p>err:{errorAboutUserName}</p> : <p>エラーなし</p>}

                  {userNameInput === "" ? <p>ユーザーネームが空です</p> :
                    (<>
                      {userNameInput}で登録しますか？？
                    </>)}
                  <Button
                    onClick={() => userNameRegisterHandler()}
                    variant="contained"
                  >
                    OK
                  </Button>
                </>
              )}

            </>
          )}

          <br />
          <h5>あなたの名前は{userName}です</h5>

          <h5>正解者</h5>
          {currentCorrectUser}

          <h5>新たにつけられた名前だよ</h5>
          {currentNewName}

          <h5>解答欄(入力)</h5>
          <Input type="text" value={answerInput} onChange={(e) => setAnswerInput(e.target.value)} />

          <Button
            onClick={answerButtonMainHandler}
            variant="contained"
            disabled={currentCorrectUser !== "" || currentNewName !== ""}
          >
            {currentProblemKind === "register" ? "登録" : "回答"}
          </Button>
          {errorAboutAnswerInput}
        </>
      )}
      {loading && <p>loading...</p>}

      {/* <h5>回答中のユーザー</h5> */}
      {/* <p>{isAbleToAnswer ? `${answeringUser}が回答中` : "回答できません！"}</p> */}
      <br />
      <br />
      <br />

      {/* 可能かどうか:{isAbleToAnswer ? "回答できます！" : "回答できません！"} */}
      <br />
      {/* 回答中のユーザー:{answeringUser} */}

      <br />
      <br />
      {role === "admin" && (
        <>
          <h5>メンバーを招待する方法</h5>
          <p>以下のQRコードを共有するか、あいことばを入力させてください。</p>
          <QRCode url={`https://quizru.vercel.app/${roomID}`} />
          <h5>あいことば</h5>
          {keyWord}

          <br />
          {/* <h5>管理者用：回答中のユーザーを削除</h5>
          <Button onClick={admin_deleteAnsweringUser} variant="contained" color="secondary"
          >
            回答中のユーザーを削除
          </Button> */}

          <h5>全体データベースに、画像を追加！！</h5>
          <h5>画像のURL</h5>
          <Input type="text" value={newImageURLInput} onChange={(e) => setNewImageURLInput(e.target.value)} />

          <h5>追加</h5>
          <Button
            onClick={newImageURLregisterHandler}
            variant="contained"
          >
            追加
          </Button>
          {errorAboutNewImageURL}
        </>
      )}



      <h1>Problem</h1>


      {currentProblemImageURL === "" ? "問題がありません" : (
        <>
          <h5>現在の問題</h5>
          <img className="problem-image"
            src={atob(currentProblemImageURL)} alt="" />
        </>
      )}


      {role === "admin" && (
        <>
          <h5>問題カードをめくるボタン</h5>
          <Button variant="contained"
            onClick={changeProblemImageHandler}>問題カードをめくる</Button>

          <h5>みんなのポイント</h5>
          {Object.keys(users).length !== 0 ? (
            <>
              {Object.keys(users).map((key) => {
                return (
                  <div key={key}>
                    <p>
                      {key}:{users[key].point}
                    </p>
                  </div>
                );
              })}
            </>) : (
            <>ユーザーなし
            </>
          )}
          <h5>すべての画像</h5>
          {Object.keys(imageURLs).length !== 0 ? (
            <>
              {Object.keys(imageURLs).map((key) => {
                // base64エンコードを解除
                const decodedKey = atob(key);
                return (
                  <div key={decodedKey}>
                    <img className="problem-image"
                      src={decodedKey} alt="" />
                    <p>
                      {imageURLs[key].name === "" ? "名前なし" : imageURLs[key].name}
                    </p>
                  </div>
                );
              })}
            </>) : (
            <>画像なし
            </>
          )}
        </>

      )}
    </>
  )
}

export default AnswerButton;
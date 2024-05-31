"use client";

import React, { useRef } from "react";

import "./index.css";

import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

import { QRCodeCanvas } from "qrcode.react";

import { useState, useEffect } from "react";
// import firebase from "@/libs/firebase/firebase";
import { db } from "@/libs/firebase/firebase";

import { Battery1, Battery2, Battery3, Battery_null, PlusIcon } from "@/libs/SVGlibrary";
import { SVGPropsType } from "@/type";
import { set } from "firebase/database";

declare global {
  interface BatteryManager {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  }
  interface Navigator {
    getBattery(): Promise<BatteryManager>;
  }
}


const Battery_charging = (props: SVGPropsType & { level: number }) => {
  return (
    <svg width="31" height="17" viewBox="0 0 31 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={props.style ? props.style : undefined} >
      <path fillRule="evenodd" clipRule="evenodd"
        d="M3 0C1.34315 0 0 1.34315 0 3V14C0 15.6569 1.34315 17 3 17H26C27.6569 17 29 15.6569 29 14V12.9999C29.0043 13 29.0085 13 29.0128 13C30.1103 13 31 10.9853 31 8.5C31 6.01472 30.1103 4 29.0128 4C29.0085 4 29.0043 4.00003 29 4.00009V3C29 1.34315 27.6569 0 26 0H3Z"
        fill="black" />
      <rect x="1" y="1" width="27" height="15" rx="2" fill="white" />
      <rect x="2" y="2" width={props.level * 25} height="13" rx="2" fill="#00FF75" />
      <path fillRule="evenodd" clipRule="evenodd" transform="translate(9.5,3)"
        d="M7.7327 6.48215L9.259 4.89999H4.84259L4.84426 4.8971L4.83344 4.89955L6.58302 0.00388336L6.57927 0L2.2209 4.51786H2.21664L0.699997 6.09H5.10754L5.10587 6.09289L5.11669 6.09044L3.3643 10.994L3.37006 11L7.72843 6.48215H7.7327Z"
        fill="white"
        stroke="black"
        strokeWidth={0.5}
      />
    </svg>
  );
};



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
  // const [errorAboutAnswerInput, setErrorAboutAnswerInput] = useState<string>("");
  // const [answeringUser, setAnsweringUser] = useState<string>("");

  const [role, setRole] = useState<"admin" | "user">("user");

  // const [errorAboutAnswerInput, seterrorAboutAnswerInput] = useState<string>("");
  const [errorAboutAnswerInput, setErrorAboutAnswerInput] = useState<string>("");

  // const [isAbleToAnswer, setIsAbleToAnswer] = useState<boolean>(false);

  const [keyWord, setKeyWord] = useState<string>("");

  const [answerInput, setAnswerInput] = useState<string>("");

  const [userNameInput, setUserNameInput] = useState<string>("");

  const [users, setUsers] = useState<{ [key: string]: { point: number } }>({});


  const [toastShow, setToastShow] = useState<boolean>(true);


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
      setErrorAboutAnswerInput("ユーザーネームが空です");
      setToastShow(true);
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
      setErrorAboutAnswerInput("ユーザーネームが空です");
      setToastShow(true);
      return;
    }
    const alreadyUsersFromDB = (await db.ref(`room/${roomID}/users`).get()).val();
    if (alreadyUsersFromDB !== null) {
      if (Object.keys(alreadyUsersFromDB).includes(userNameInput)) {
        setErrorAboutAnswerInput("すでに存在するユーザーネームですが続行しますか？(グループとしての使用になります)");
        setToastShow(true);
      } else {
        setErrorAboutAnswerInput("");
      }
    }
  }

  const [newImageURLInput, setNewImageURLInput] = useState<string>("");

  const newImageURLregisterHandler = async () => {
    if (newImageURLInput === "") {
      setErrorAboutAnswerInput("URLが空です");
      setToastShow(true);
      return;
    }
    if (!newImageURLInput.startsWith("http")) {
      setErrorAboutAnswerInput("URLが不正です");
      setToastShow(true);
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
      setErrorAboutAnswerInput("すでに存在するURLです")
      setToastShow(true);
      return;
    }
    // base64エンコードして、キーとして使う
    const newImageURLInputEncoded = btoa(newImageURLInput);
    imageURLs[newImageURLInputEncoded] = {
      "name": "",
    }
    await db.ref("database").set(imageURLs);
    setErrorAboutAnswerInput("追加に成功しました！");
    setToastShow(true);
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
      if (imageURLs[currentProblemImageURL] && imageURLs[currentProblemImageURL].name === "") {
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
    if (userName !== currentCorrectUser) {
      setErrorAboutAnswerInput("");
    }
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
    // もし、正解者がいなかったら、累積ポイントを+1する
    // また、登録ターンの場合も、累積ポイントを+1する
    if (currentCorrectUser === "" || currentProblemKind === "register") {
      const accumulatedPoint = (await db.ref(`room/${roomID}/accumulatedPoint`).get()).val();
      await db.ref(`room/${roomID}/accumulatedPoint`).set(accumulatedPoint + 1);
    } else {
      await db.ref(`room/${roomID}/accumulatedPoint`).set(0);
    }
  }

  const answerButtonMainHandler = async () => {
    // 登録、または回答をする
    if (currentProblemKind === "register") {
      if (answerInput === "") {
        setErrorAboutAnswerInput("名前が空です");
        // callToastNotification("名前が空です", 3000);
        setToastShow(true);
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
        setToastShow(true);
        // callToastNotification("すでに存在する名前です", 3000);
        return;
      }
      // なければ、登録
      imageURLs[currentProblemImageURL].name = answerInput;
      await db.ref(`database`).set(imageURLs);
      // また、この回答を、全員に通知する
      await db.ref(`room/${roomID}/currentNewName`).set(answerInput);
      await db.ref(`room/${roomID}/currentCorrectUser`).set(userName);
      setErrorAboutAnswerInput("登録に成功しました");
      // callToastNotification("登録に成功しました", 3000);
      setToastShow(true);


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
          setErrorAboutAnswerInput("正解です!!");
          // callToastNotification("正解です!!", 3000);
          setToastShow(true);

          const accumulatedPoint = (await db.ref(`room/${roomID}/accumulatedPoint`).get()).val();
          await db.ref(`room/${roomID}/users/${userName}/point`).set(userPoint + accumulatedPoint);
          // また、この回答を、全員に通知する

          await db.ref(`room/${roomID}/currentCorrectUser`).set(userName);
        } else {
          setErrorAboutAnswerInput("不正解です!!");
          setToastShow(true);
          // callToastNotification("不正解です!!", 3000);
          // 不正解
        }
      } else {
        setErrorAboutAnswerInput("すでに回答が終了しています");
        setToastShow(true);
        // callToastNotification("すでに回答が終了しています", 3000);
      }
    }
  }



  const [date, setDate] = useState(new Date());
  const [battery, setBattery] = useState({ level: 0, charging: false });


  useEffect(() => {
    const timerID = setInterval(() => setDate(new Date()), 1000);
    try {
      navigator.getBattery().then((bat) => {
        setBattery({ level: bat.level, charging: bat.charging });
        bat.onlevelchange = () => setBattery({ level: bat.level, charging: bat.charging });
        bat.onchargingchange = () => setBattery({ level: bat.level, charging: bat.charging });
      });
    } catch (e) { // iOSなどではnavigator.getBattery()が使えない
      // console.log(e);
    }
    return function cleanup() {
      clearInterval(timerID);
    };
  }, []);

  const ChooseBattery: React.FC = () => {
    const level: number = battery.level;
    const isCharging: boolean = battery.charging;

    const iconSize = 40;
    const iconStyle = { width: `${iconSize}px`, height: `${iconSize}px` };

    if (isCharging) {
      return <Battery_charging style={iconStyle} level={level} />;
    } else if (level > 0.5) {
      return <Battery3 style={iconStyle} />;
    } else if (level > 0.2) {
      return <Battery2 style={iconStyle} />;
    } else if (level > 0) {
      return <Battery1 style={iconStyle} />;
    } else { // level === 0
      return <Battery_null style={iconStyle} />;
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setToastShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/** toast */}
      <div className={`toast-notification ${toastShow ? 'toastShow' : ''}`}>
        <p>{errorAboutAnswerInput}</p>
      </div>
      {/* <h5>roomID</h5>
      {roomID} */}
      {/* {role === "admin" ? "管理者" : "ユーザー"} */}
      {role === "user" && ( // adminは名前不要
        <>
          {userName === "" ? (
            <>
              <h3>ユーザーネームを入力してください。</h3>
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
                  {errorAboutAnswerInput !== "" ? <p>err:{errorAboutAnswerInput}</p> : <p>エラーなし</p>}

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
          ) : (
            <>
              <div className="header">
                <div className="info-container">
                  <div className="time-container">
                    {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
                  </div>
                  <div className="battery-container">
                    <ChooseBattery />
                  </div>
                </div>
                <div className="profile-container">
                  <div className="lv-container">
                    <p className="mini-title">Pt.</p>
                    {/* <p className="profile-lv">0</p> */}
                    <div className="profile-lv input-form"
                    >
                      {users.hasOwnProperty(userName) ? users[userName].point : 0}
                    </div>
                  </div>
                  <div className="name-container">
                    <p className="mini-title">name</p>
                    <div className="profile-name input-form"
                    >
                      {userName}
                    </div>
                    {/* <p className="profile-name">{username}</p> */}
                  </div>
                </div>
              </div>

              <br />
              <br />
              <br />
              <br />
              <br />
              <div className="answer-content-wrapper"
              >
                <h1>問題</h1>
                {currentProblemImageURL === "" ? "問題がありません" : (
                  <>
                    <img className="problem-image"
                      src={atob(currentProblemImageURL)} alt="" />
                  </>
                )}

                <h5>解答欄(入力)</h5>
                <Input type="text" value={answerInput}
                  // enterキーでもsubmit
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      answerButtonMainHandler();
                    }
                  }}
                  onChange={(e) => setAnswerInput(e.target.value)} />

                <Button
                  onClick={answerButtonMainHandler}
                  variant="contained"
                  disabled={currentCorrectUser !== "" || currentNewName !== ""}
                >
                  {currentProblemKind === "register" ? "登録" : "回答"}
                </Button>
                <br />
                <br />
                {/* {errorAboutAnswerInput} */}
                <br />

                <h5>正解者</h5>
                {currentCorrectUser}

                <h5>新たにつけられた名前</h5>
                {currentNewName}
              </div>



            </>
          )}

        </>
      )}
      {loading && <p>loading...</p>}

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
          <h1>回答</h1>
          {imageURLs[currentProblemImageURL] === undefined ? "問題がありません" : (
            <>
              {imageURLs[currentProblemImageURL].name}
            </>
          )}
          <h1>問題</h1>
          {currentProblemImageURL === "" ? "問題がありません" : (
            <>
              <img className="problem-image"
                src={atob(currentProblemImageURL)} alt="" />
            </>
          )}
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
          {errorAboutAnswerInput}
        </>
      )}

      {role === "admin" && (
        <>

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
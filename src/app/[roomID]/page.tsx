// UUID v4で部屋が生えており
"use client";

// ここにはあんまりdb書きたくない

import AnswerButton from "@/components/AnswerButton";

import Button from "@mui/material/Button";

const Page = ({ params }: { params: { roomID: string } }) => {

  const goToHomeButtonHandler = () => {
    window.location.href = '/';
  }

  return (
    <>
      <AnswerButton roomID={params.roomID} />
      <br />
      <br />
      <br />
      <Button onClick={goToHomeButtonHandler}>ホームに戻る</Button>
    </>
  )
}

export default Page;
# DJS-MusicBot

올인원 음악봇입니다. 이슈, PR 환영

## 설명

@discordjs/voice를 기반으로 작성된 외부 모듈 없는 오픈소스 음악봇입니다.

- 사용한 모듈
- - discord.js
- - @discordjs/voice - 음성 모듈
- - ytdl - 유튜브 영상 로드
- - ytsr - 유튜브 영상 검색
- - ytpl - 유튜브 재생목록 로드

## 초기 설정

쉘에 다음 커맨드를 입력하세요.

```sh
npm run setup
```

.env.example 형식에 맞춰 .env 파일을 생성하세요.

FFmpeg를 기기에 설치하고 환경 변수로 설정하거나, ffmpeg-static을 npm으로 설치하세요.

## 봇 시작하기

쉘에 다음 커맨드를 입력해 봇을 시작합니다.

```js
npm start
```
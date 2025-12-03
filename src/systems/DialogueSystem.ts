export interface Dialogue {
  text: string
  duration: number
  style?: 'thought' | 'speak' | 'shout'
}

export class DialogueSystem {
  private currentDialogue: Dialogue | null = null
  private dialogueTimer: number = 0
  private dialogueQueue: Dialogue[] = []
  private cooldowns: Map<string, number> = new Map()
  private lastShownDialogue: string = ''

  // 내면 독백 - 꽁초 수집
  private buttCollectDialogues = {
    short: [
      "필터까지 태웠네... 급했나보다",
      "이거라도 감사하지",
      "한 모금이라도 남았으려나",
      "...비참하군",
      "짧아도 괜찮아. 있으면 된 거야",
    ],
    normal: [
      "아직 따뜻하네...",
      "누군가의 마지막 한 모금이었겠지",
      "괜찮은 놈이야",
      "이 정도면 버틸 수 있어",
      "고마워, 모르는 누군가",
    ],
    long: [
      "...대박",
      "이건 진짜 횡재다",
      "세상에 아직 좋은 일이 있군",
      "신이시여 감사합니다",
      "오늘은 좋은 날이야",
    ],
  }

  // 내면 독백 - 니코틴 상태
  private nicotineDialogues = {
    critical: [  // 0-15%
      "손이... 떨린다",
      "머리가 깨질 것 같아",
      "제발... 뭐라도...",
      "눈앞이 흐려진다",
      "조금만... 조금만 더",
      "숨을 쉴 수가 없어",
    ],
    low: [  // 15-30%
      "집중이 안 돼",
      "짜증이 밀려온다",
      "빨리 찾아야 해",
      "어디... 어디 없나",
      "시간이 없어",
    ],
    recovering: [  // 막 피웠을 때
      "...후",
      "살 것 같다",
      "이 맛에 사는 거지",
      "잠깐이라도 사람 같네",
      "세상이 좀 보인다",
    ],
    high: [  // 80% 이상
      "...평화롭군",
      "이대로 영원하면 좋겠다",
      "모든 게 선명해",
      "드디어 숨을 쉴 수 있어",
    ],
  }

  // 내면 독백 - 경찰 관련
  private policeDialogues = {
    spotted: [
      "젠장, 경찰이다",
      "들켰나?",
      "침착해... 침착해...",
    ],
    chased: [
      "뛰어!",
      "잡히면 안 돼",
      "제발 제발 제발",
    ],
    escaped: [
      "휴... 떨어졌다",
      "위험했어",
    ],
  }

  // 내면 독백 - 라이벌 관련
  private rivalDialogues = {
    stolenButt: [
      "저 자식이...!",
      "내 꽁초를...",
      "빼앗겼다",
      "더 빨리 움직여야 해",
    ],
    seeingRival: [
      "저 녀석도 같은 처지군",
      "...동료인가, 경쟁자인가",
    ],
  }

  // 내면 독백 - 상점 관련
  private shopDialogues = {
    noMoney: [
      "돈이 없어...",
      "500원만 있으면...",
      "저 담배가 눈에 밟힌다",
    ],
    bought: [
      "드디어 제대로 된 걸",
      "역시 새 담배가 최고야",
      "사치지만... 필요해",
    ],
  }

  // NPC 대사
  private npcDialogues = {
    worker: {
      smoking: [
        "...",
        "후...",
        "(한숨)",
        "퇴근하고 싶다...",
      ],
      drop: [
        "(담배를 던지고 발로 비빈다)",
      ],
    },
    drunk: {
      smoking: [
        "크으~ 좋다~",
        "히히히...",
        "인생이 뭔지 알아?",
        "어이~ 형씨~",
      ],
      drop: [
        "(비틀거리며 담배를 떨어뜨린다)",
        "엇... 어디갔지?",
      ],
    },
    student: {
      smoking: [
        "(주변을 두리번거린다)",
        "빨리 피워야지...",
        "(급하게 빨아들인다)",
      ],
      drop: [
        "(급히 던지고 뛴다)",
        "아 시간 없어!",
      ],
    },
    vaper: {
      smoking: [
        "후우우~",
        "(구름 같은 연기를 뿜는다)",
        "이게 미래야",
      ],
      drop: [], // 베이퍼는 꽁초 안 떨굼
    },
  }

  // 시작 독백
  private openingDialogues = [
    "오늘도... 시작이다",
    "어디 괜찮은 거 없나",
  ]

  update(dt: number): void {
    // 쿨다운 업데이트
    for (const [key, time] of this.cooldowns) {
      this.cooldowns.set(key, time - dt)
      if (time - dt <= 0) {
        this.cooldowns.delete(key)
      }
    }

    // 현재 대사 타이머
    if (this.currentDialogue) {
      this.dialogueTimer -= dt
      if (this.dialogueTimer <= 0) {
        this.currentDialogue = null
        // 큐에 다음 대사가 있으면 표시
        if (this.dialogueQueue.length > 0) {
          const next = this.dialogueQueue.shift()!
          this.showDialogue(next)
        }
      }
    }
  }

  private showDialogue(dialogue: Dialogue): void {
    this.currentDialogue = dialogue
    this.dialogueTimer = dialogue.duration
    this.lastShownDialogue = dialogue.text
  }

  private queueDialogue(text: string, duration: number = 2.5, style: 'thought' | 'speak' | 'shout' = 'thought'): void {
    const dialogue: Dialogue = { text, duration, style }
    
    if (!this.currentDialogue) {
      this.showDialogue(dialogue)
    } else {
      // 큐가 너무 길어지지 않도록
      if (this.dialogueQueue.length < 2) {
        this.dialogueQueue.push(dialogue)
      }
    }
  }

  private getRandomDialogue(dialogues: string[]): string {
    // 마지막에 보여준 것과 다른 걸 선택
    let attempts = 0
    let selected: string
    do {
      selected = dialogues[Math.floor(Math.random() * dialogues.length)]
      attempts++
    } while (selected === this.lastShownDialogue && attempts < 5 && dialogues.length > 1)
    return selected
  }

  private checkCooldown(key: string, cooldownTime: number): boolean {
    if (this.cooldowns.has(key)) return false
    this.cooldowns.set(key, cooldownTime)
    return true
  }

  // === 이벤트 트리거 메서드들 ===

  onGameStart(): void {
    setTimeout(() => {
      this.queueDialogue(this.getRandomDialogue(this.openingDialogues), 3)
    }, 1000)
  }

  onButtCollected(quality: 'short' | 'normal' | 'long'): void {
    const dialogues = this.buttCollectDialogues[quality]
    this.queueDialogue(this.getRandomDialogue(dialogues), 2.5)
  }

  onNicotineCritical(): void {
    if (this.checkCooldown('nicotine_critical', 8)) {
      this.queueDialogue(this.getRandomDialogue(this.nicotineDialogues.critical), 2, 'thought')
    }
  }

  onNicotineLow(): void {
    if (this.checkCooldown('nicotine_low', 12)) {
      this.queueDialogue(this.getRandomDialogue(this.nicotineDialogues.low), 2)
    }
  }

  onSmoked(): void {
    this.queueDialogue(this.getRandomDialogue(this.nicotineDialogues.recovering), 2)
  }

  onNicotineHigh(): void {
    if (this.checkCooldown('nicotine_high', 15)) {
      this.queueDialogue(this.getRandomDialogue(this.nicotineDialogues.high), 2.5)
    }
  }

  onPoliceSpotted(): void {
    if (this.checkCooldown('police', 10)) {
      this.queueDialogue(this.getRandomDialogue(this.policeDialogues.spotted), 1.5, 'thought')
    }
  }

  onPoliceChase(): void {
    if (this.checkCooldown('police_chase', 5)) {
      this.queueDialogue(this.getRandomDialogue(this.policeDialogues.chased), 1, 'shout')
    }
  }

  onRivalStoleButt(): void {
    if (this.checkCooldown('rival_steal', 8)) {
      this.queueDialogue(this.getRandomDialogue(this.rivalDialogues.stolenButt), 2)
    }
  }

  onShopNoMoney(): void {
    if (this.checkCooldown('shop_no_money', 10)) {
      this.queueDialogue(this.getRandomDialogue(this.shopDialogues.noMoney), 2)
    }
  }

  onShopBought(): void {
    this.queueDialogue(this.getRandomDialogue(this.shopDialogues.bought), 2)
  }

  getNPCDialogue(type: 'worker' | 'drunk' | 'student' | 'vaper', event: 'smoking' | 'drop'): string | null {
    const dialogues = this.npcDialogues[type][event]
    if (dialogues.length === 0) return null
    return this.getRandomDialogue(dialogues)
  }

  getCurrentDialogue(): Dialogue | null {
    return this.currentDialogue
  }

  getDialogueProgress(): number {
    if (!this.currentDialogue) return 0
    return this.dialogueTimer / this.currentDialogue.duration
  }
}

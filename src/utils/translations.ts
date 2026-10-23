export type Language = 'en' | 'ar';

export const TRANSLATIONS = {
  en: {
    appTitle: 'FOOTBALL CARDS CHALLENGE',
    appSubtitle: 'Europe’s Elite 5 Leagues Card Trivia & Squad Builder',
    playNow: 'PLAY NOW',
    mainMenu: 'MAIN MENU',
    gameModes: 'GAME MODES',
    modes: {
      draftBattle: {
        title: 'Football Draft Battle',
        desc: 'Draft 11 stars round-by-round from 4 random card choices, battle your friends on same phone or online, and simulate full matches!',
        btn: 'Start Draft Battle'
      },
      guess: {
        title: 'Guess the Player',
        desc: '10-round challenge. Spot the right player card based on leagues, stats, and clubs.',
        btn: 'Play 10 Rounds'
      },
      dreamTeam: {
        title: 'Build Dream Team',
        desc: 'Collect cards, build tactical formations (4-3-3, 4-2-3-1), and calculate chemistry.',
        btn: 'Open Pitch'
      },
      endless: {
        title: 'Endless Challenge',
        desc: 'Unlimited rounds! Score streaks, avoid penalties, and reach legendary high scores.',
        btn: 'Survive & Score'
      },
      daily: {
        title: 'Daily Challenge',
        desc: '5 daily curated cards challenges. Maintain your daily streak for bonus card packs!',
        btn: 'Play Daily'
      },
      collection: {
        title: 'My Card Binder',
        desc: 'View your unlocked player cards, stats, rarities, and league breakdowns.',
        btn: 'View Binder'
      },
      packs: {
        title: 'Card Packs Store',
        desc: 'Open Bronze, Gold, and Champions packs to discover legendary players!',
        btn: 'Open Packs'
      }
    },
    challenge: {
      round: 'Round',
      question: 'Question',
      selectPrompt: 'Select the card that answers the challenge above:',
      streak: 'Streak',
      score: 'Score',
      bonusText: 'Streak Bonus Active!',
      nextRound: 'Next Round',
      finishRound: 'View Results',
      correct: 'GOAL! Correct Answer!',
      incorrect: 'MISS! Incorrect Card',
      penalty: '-25 Pts',
      reward: '+100 Pts',
      streakBonus: 'STREAK BONUS: +{pts} Pts!'
    },
    stats: {
      overall: 'OVR',
      pace: 'PAC',
      shooting: 'SHO',
      passing: 'PAS',
      dribbling: 'DRI',
      defending: 'DEF',
      physical: 'PHY',
      goals: 'Goals',
      assists: 'Assists',
      cleanSheets: 'Clean Sheets',
      apps: 'Matches',
      age: 'Age',
      foot: 'Foot',
      club: 'Club',
      league: 'League',
      nationality: 'Nation',
      position: 'POS'
    },
    positions: {
      GK: 'Goalkeeper',
      DEF: 'Defender',
      MID: 'Midfielder',
      FWD: 'Forward'
    },
    leagues: {
      'Premier League': 'Premier League',
      'La Liga': 'La Liga',
      'Bundesliga': 'Bundesliga',
      'Serie A': 'Serie A',
      'Ligue 1': 'Ligue 1'
    },
    results: {
      gameComplete: 'Match Finished!',
      finalScore: 'Final Score',
      accuracy: 'Accuracy',
      correctAnswers: 'Correct Picks',
      maxStreak: 'Highest Streak',
      coinsEarned: 'Coins Earned',
      playAgain: 'Play Again',
      mainMenu: 'Return to Menu',
      openPack: 'Open Free Reward Pack!'
    },
    dreamTeam: {
      squadTitle: 'Ultimate Dream Team Builder',
      formation: 'Formation',
      chemistry: 'Chemistry',
      squadRating: 'Squad OVR',
      emptySlot: 'Empty Slot',
      selectPlayer: 'Select Player for {pos}',
      swapPlayer: 'Swap Player',
      autoBuild: 'Auto-Fill Best Cards',
      clearSquad: 'Clear Pitch',
      noEligible: 'No unlocked players found for this position. Play challenges or open packs to get more cards!'
    },
    packs: {
      storeTitle: 'Football Card Packs',
      storeSubtitle: 'Spend coins earned from challenges to unlock stars for your team',
      coinsAvailable: 'Coins Balance',
      openButton: 'Open Pack ({cost} 🪙)',
      insufficientCoins: 'Not enough coins! Play challenges to earn more.',
      congratulations: 'NEW PLAYERS UNLOCKED!',
      collectAll: 'Add to Collection',
      opening: 'Tearing Pack Open...'
    },
    settings: {
      title: 'Game Settings',
      language: 'Language',
      sound: 'Sound Effects',
      resetData: 'Reset Local Progress',
      confirmReset: 'Are you sure you want to reset all cards, coins and streaks?',
      close: 'Close',
      about: 'About Football Cards Challenge',
      aboutText: 'A high-intensity football trivia and squad building simulation featuring real players from Europe’s Big 5 Leagues.'
    },
    daily: {
      todayStatus: 'Today\'s Daily Match',
      completedToday: 'You completed today\'s daily challenge!',
      comeBackTomorrow: 'Next challenge unlocks tomorrow. Current streak: {days} days!',
      startChallenge: 'Start Daily 5 Rounds'
    },
    draftBattle: {
      title: 'Football Draft Battle',
      subtitle: 'Build your 11-player squad pick-by-pick from real European stars, battle friends on same phone or online, and simulate full matches!',
      selectMode: 'Choose Battle Mode',
      passAndPlay: 'Pass & Play (Same Phone)',
      passAndPlayDesc: '2 Friends take turns drafting round-by-round on this same device',
      soloVsAi: 'Solo vs AI Rival',
      soloVsAiDesc: 'Draft your dream team and battle against a smart AI coach',
      onlineRoom: 'Room Battle & Share Code',
      onlineRoomDesc: 'Generate or enter an 8-character squad battle code to face your friend’s team',
      player1Name: 'Player 1',
      player2Name: 'Player 2',
      aiName: 'AI Coach',
      stageIndicator: 'Round {current} / 11: Drafting {pos}',
      passDevicePrompt: 'Pass the device to {player}',
      readyButton: 'I’m Ready to Pick!',
      pickCardPrompt: 'Select 1 player card to add to your squad:',
      yourSquad: 'Your 11-Man Squad',
      battleTitle: 'SQUAD CLASH & COMPARISON',
      totalRating: 'Total OVR',
      attack: 'Attack',
      midfield: 'Midfield',
      defense: 'Defense',
      gk: 'Goalkeeper',
      chemistry: 'Chemistry',
      simulateMatch: 'Simulate Match',
      simulating: 'Simulating Match on Pitch...',
      winner: 'WINNER!',
      draw: 'DRAW! Decided by Penalty Shootout',
      matchEvents: 'Match Timeline & Highlights',
      motm: 'Player of the Match',
      saveSquad: 'Save Squad to History',
      squadSaved: 'Squad saved successfully!',
      savedSquadsTitle: 'Saved Draft Battle Squads',
      noSavedSquads: 'No saved drafts yet. Finish a draft battle to save your lineup!',
      shareSquadCode: 'Squad Battle Code',
      copyCode: 'Copy Code',
      codeCopied: 'Code copied to clipboard!',
      importSquad: 'Import Friend’s Squad Code',
      enterCode: 'Enter 8-digit squad code...',
      importBtn: 'Load & Battle',
      invalidCode: 'Invalid squad code. Please check and try again.',
      newDraft: 'New Draft Battle'
    }
  },
  ar: {
    appTitle: 'تحدي بطاقات كرة القدم',
    appSubtitle: 'لعبة البطاقات والتحدي التفاعلية لأبرز نجوم الدوريات الأوروبية الخمسة الكبرى',
    playNow: 'العب الآن',
    mainMenu: 'القائمة الرئيسية',
    gameModes: 'أنماط اللعب',
    modes: {
      draftBattle: {
        title: 'معركة الدرفت (Draft Battle)',
        desc: 'ابنِ تشكيلة 11 لاعباً مرحلة بمرحلة من 4 خيارات، وواجه أصدقاءك على نفس الهاتف أو أونلاين بمحاكاة للمباراة!',
        btn: 'دخول معركة الدرفت'
      },
      guess: {
        title: 'خمّن اللاعب',
        desc: 'تحدٍ من 10 جولات. اختر بطاقة اللاعب الصحيحة بناءً على الأندية والإحصائيات.',
        btn: 'العب 10 جولات'
      },
      dreamTeam: {
        title: 'ابنِ فريق أحلامك',
        desc: 'اجمع البطاقات وابنِ تشكيلة تكتيكية (4-3-3 أو 4-2-3-1) واحسب كيمياء الفريق.',
        btn: 'دخول الملعب'
      },
      endless: {
        title: 'التحدي اللانهائي',
        desc: 'جولات بلا توقف! حقق سلاسل انتصارات متتالية وتفادَ النقاط المخصومة لتحقيق رقم قياسي.',
        btn: 'تحدَّ وحقق الأرقام'
      },
      daily: {
        title: 'التحدي اليومي',
        desc: '5 جولات يومية خاصة. حافظ على سلسلة أيامك لتحصل على حزم بطاقات أسطورية!',
        btn: 'العب اليومي'
      },
      collection: {
        title: 'مكتبة بطاقاتي',
        desc: 'استعرض جميع البطاقات التي فتحتها وإحصائياتها والندرَة وتفاصيل كل دوري.',
        btn: 'عرض البطاقات'
      },
      packs: {
        title: 'متجر حزم البطاقات',
        desc: 'افتح الحزم الفضية والذهبية والأبطال لكشف واقتناء ألمع نجوم العالم!',
        btn: 'افتح الحزم'
      }
    },
    challenge: {
      round: 'الجولة',
      question: 'السؤال',
      selectPrompt: 'اختر البطاقة التي تجيب عن السؤال أعلاه:',
      streak: 'سلسلة الانتصارات',
      score: 'النقاط',
      bonusText: 'مكافأة السلسلة نشطة!',
      nextRound: 'الجولة التالية',
      finishRound: 'عرض النتائج',
      correct: 'هدف! إجابة صحيحة!',
      incorrect: 'فرصة ضائعة! بطاقة خاطئة',
      penalty: '-25 نقطة',
      reward: '+100 نقطة',
      streakBonus: 'مكافأة متتالية: +{pts} نقطة!'
    },
    stats: {
      overall: 'التقييم',
      pace: 'السرعة',
      shooting: 'التسديد',
      passing: 'التمرير',
      dribbling: 'المراوغة',
      defending: 'الدفاع',
      physical: 'القوة البدنية',
      goals: 'الأهداف',
      assists: 'التمريرات الحاسمة',
      cleanSheets: 'شباك نظيفة',
      apps: 'المباريات',
      age: 'العمر',
      foot: 'القدم',
      club: 'النادي',
      league: 'الدوري',
      nationality: 'الجنسية',
      position: 'المركز'
    },
    positions: {
      GK: 'حارس مرمى',
      DEF: 'مدافع',
      MID: 'لاعب وسط',
      FWD: 'مهاجم'
    },
    leagues: {
      'Premier League': 'الدوري الإنجليزي الممتاز',
      'La Liga': 'الدوري الإسباني (لا ليغا)',
      'Bundesliga': 'الدوري الألماني (البوندسليغا)',
      'Serie A': 'الدوري الإيطالي (سيريا أ)',
      'Ligue 1': 'الدوري الفرنسي (ليغ 1)'
    },
    results: {
      gameComplete: 'صافرة النهاية!',
      finalScore: 'النتيجة النهائية',
      accuracy: 'نسبة الدقة',
      correctAnswers: 'الإجابات الصحيحة',
      maxStreak: 'أعلى سلسلة متتالية',
      coinsEarned: 'الكوينز المكتسبة',
      playAgain: 'إعادة المباراة',
      mainMenu: 'القائمة الرئيسية',
      openPack: 'فتح حزمة المكافأة!'
    },
    dreamTeam: {
      squadTitle: 'بناء تشكيلة الأحلام',
      formation: 'الخطة التكتيكية',
      chemistry: 'تناغم التشكيلة',
      squadRating: 'تقييم الفريق',
      emptySlot: 'مركز فارغ',
      selectPlayer: 'اختر لاعباً لمركز {pos}',
      swapPlayer: 'تبديل اللاعب',
      autoBuild: 'إكمال تلقائي بأفضل النجوم',
      clearSquad: 'تفريغ التشكيلة',
      noEligible: 'لا توجد بطاقات مفتوحة لهذا المركز. العب التحديات أو افتح الحزم للحصول على المزيد!'
    },
    packs: {
      storeTitle: 'متجر حزم بطاقات كرة القدم',
      storeSubtitle: 'استخدم الكوينز التي كسبتها في التحديات لفتح نجوم كبار لفريقك',
      coinsAvailable: 'رصيد الكوينز',
      openButton: 'افتح الحزمة ({cost} 🪙)',
      insufficientCoins: 'الرصيد لا يكفي! العب التحديات لكسب المزيد من الكوينز.',
      congratulations: 'تم كشف لاعبين جدد!',
      collectAll: 'إضافة للمجموعة',
      opening: 'جاري فتح الحزمة...'
    },
    settings: {
      title: 'إعدادات اللعبة',
      language: 'اللغة',
      sound: 'المؤثرات الصوتية',
      resetData: 'إعادة ضبط التقدم',
      confirmReset: 'هل أنت متأكد من رغبتك في إعادة تعيين كافة البطاقات والرصيد والأرقام القياسية؟',
      close: 'إغلاق',
      about: 'عن تحدي بطاقات كرة القدم',
      aboutText: 'لعبة مسابقات وتحدي بطاقات واقعية وتكتيكات تضم ألمع نجوم الدوريات الأوروبية الخمس الكبرى.'
    },
    daily: {
      todayStatus: 'مباراة اليوم',
      completedToday: 'أحسنت! لقد أتممت تحدي اليوم بنجاح!',
      comeBackTomorrow: 'التحدي التالي يفتح غداً. سلسلتك الحالية: {days} أيام!',
      startChallenge: 'بدء 5 جولات يومية'
    },
    draftBattle: {
      title: 'معركة الدرفت (Draft Battle)',
      subtitle: 'ابنِ تشكيلة 11 لاعباً مركزاً بمركز من نجوم الدوريات الأوروبية الخمسة، وتحدَّ أصدقاءك على نفس الهاتف أو عبر الإنترنت!',
      selectMode: 'اختر نمط المعركة',
      passAndPlay: 'اللعب بالتناوب (على نفس الهاتف)',
      passAndPlayDesc: 'صديقان يتناوبان مرحلة بمرحلة على نفس الجهاز لاختيار تشكيلتيهما',
      soloVsAi: 'لعب فردي ضد الذكاء الاصطناعي',
      soloVsAiDesc: 'اختر تشكيلتك وواجه مدرباً آلياً ذكياً يبني تشكيلة قوية ضدك',
      onlineRoom: 'مواجهة عبر كود التحدي',
      onlineRoomDesc: 'أنشئ أو أدخل كود التشكيلة (8 أرقام) لمواجهة تشكيلة صديقك وحساب النتيجة فورياً',
      player1Name: 'اللاعب 1',
      player2Name: 'اللاعب 2',
      aiName: 'المدرب الآلي',
      stageIndicator: 'المرحلة {current} من 11: اختيار مركز {pos}',
      passDevicePrompt: 'مرّر الهاتف إلى {player}',
      readyButton: 'أنا جاهز للاختيار!',
      pickCardPrompt: 'اختر بطاقة واحدة من أصل 4 نجوم لإضافتها لتشكيلتك:',
      yourSquad: 'تشكيلتك المكتملة (11 لاعباً)',
      battleTitle: 'المواجهة المباشرة ومقارنة التشكيلتين',
      totalRating: 'التقييم الإجمالي',
      attack: 'الهجوم',
      midfield: 'الوسط',
      defense: 'الدفاع',
      gk: 'حراسة المرمى',
      chemistry: 'تناغم الفريق',
      simulateMatch: 'انطلاق محاكاة المباراة',
      simulating: 'جاري محاكاة مجريات المباراة على أرض الملعب...',
      winner: 'الفائز بالمعركة!',
      draw: 'تعادل! تم الحسم بركلات الترجيح',
      matchEvents: 'أبرز أحداث ومجريات المباراة',
      motm: 'رجل المباراة (MOTM)',
      saveSquad: 'حفظ التشكيلة في السجل',
      squadSaved: 'تم حفظ التشكيلة بنجاح!',
      savedSquadsTitle: 'التشكيلات المحفوظة لمعارك الدرفت',
      noSavedSquads: 'لا توجد تشكيلات محفوظة حتى الآن. أكمل درفت لحفظ تشكيلتك هنا!',
      shareSquadCode: 'كود التشكيلة للمشاركة',
      copyCode: 'نسخ الكود',
      codeCopied: 'تم نسخ الكود للحافظة!',
      importSquad: 'استيراد تشكيلة صديقك',
      enterCode: 'أدخل كود التشكيلة...',
      importBtn: 'تحميل وبدء المعركة',
      invalidCode: 'كود التشكيلة غير صحيح، تأكد وأعد المحاولة.',
      newDraft: 'بدء درفت جديد'
    }
  }
};

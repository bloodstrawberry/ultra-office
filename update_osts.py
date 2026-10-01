import json
import glob
import os

ost_mapping = {
    "가르델 간발의 차이로(Gardel Por Una Cabeza)": ["영화 '여인의 향기' (1992)", "영화 '트루 라이즈' (1994)", "영화 '쉰들러 리스트' (1993)", "한국 드라마 '여인의 향기' (2011)", "한국 화장품 광고"],
    "거슈윈 랩소디 인 블루(Gershwin Rhapsody In Blue)": ["드라마 '노다메 칸타빌레' (2006)", "영화 '위대한 개츠비' (2013)", "영화 '환타지아 2000' (1999)", "유나이티드 항공 광고"],
    "그리그 산왕의 궁전에서(Grieg In the Hall of the Mountain King)": ["한국 영화 '마더' (2009)", "영화 '소셜 네트워크' (2010)", "영화 '트롤' (2016)", "다수의 테마파크 및 핼러윈 관련 광고", "한국 자동차 보험 CF"],
    "그리그 페르귄트 모음곡 제1번 중 아침의 기분(Grieg Peer Gynt Suite No.1, Op. 46, Morning Mood)": ["한국 커피 광고 (맥심, 네스카페 등 다수)", "한국 침대/가구 광고", "영화 '소일렌트 그린' (1973)", "애니메이션 '심슨 가족'"],
    "드보르자크 교향곡 9번 '신세계로부터' E단조 Op.95 4악장(Dvořák Symphony No. 9, 'From the New World', Op. 95-IV)": ["한국 롯데제과 '죠스바' CF", "한국 드라마 '베토벤 바이러스' (2008)", "영화 '죠스' 패러디 BGM"],
    "드보르자크 유모레스크 7번(Dvořák Humoresque No. 7, Op. 101)": ["한국 코믹 예능 및 일상 광고 BGM 다수", "오르골 및 동요 애니메이션"],
    "드뷔시 달빛(Debussy Clair de Lune)": ["영화 '트와일라잇' (2008)", "영화 '오션스 일레븐' (2001)", "한국 드라마 '브람스를 좋아하세요?' (2020)", "영화 '에브리씽 에브리웨어 올 앳 원스' (2022)", "한국 침대 CF"],
    "라벨 볼레로(Ravel Bolero)": ["애니메이션 '디지몬 어드벤처' 극장판", "영화 '사랑과 슬픔의 볼레로' (1981)", "한국 영화 '밀정' (2016)", "영화 '10' (1979)"],
    "로시니 세빌리아의 이발사 서곡(Rossini The Barber of Seville - Overture)": ["애니메이션 '벅스 버니' (Rabbit of Seville)", "한국 코믹/요리 예능 프로그램 BGM"],
    "로시니 윌리엄 텔 서곡(Rossini William Tell - Overture)": ["영화 '론 레인저' (2013)", "한국 '동아제약 박카스' 광고", "다수의 달리기/경주 예능 BGM", "영화 '시계태엽 오렌지' (1971)"],
    "리스트 라 캄파넬라(Liszt La Campanella)": ["한국 드라마 '밀회' (2014)", "애니메이션 '피아노의 숲' (2007)", "영화 '샤인' (1996)", "한국 피아노 콩쿠르 소재 예능/다큐 BGM"],
    "림스키코르사코프 왕벌의 비행(Rimsky-Korsakov Flight of the Bumblebee)": ["영화 '샤인' (1996)", "영화 '킬 빌 1' (2003)", "한국 예능 쫓고 쫓기는 씬 단골 BGM", "게임 '테트리스' 편곡 BGM"],
    "멘델스존 한여름 밤의 꿈 중 축혼 행진곡(Mendelssohn A Midsummer Night's Dream, 'Wedding March')": ["전 세계 결혼식 퇴장곡", "한국 영화 '결혼 이야기' (1992)", "다수의 웨딩 관련 CF"],
    "모차르트 마술피리 중 밤의 여왕 아리아(Mozart The Magic Flute, 'Queen of the Night aria')": ["한국 드라마 '펜트하우스' (2020-2021)", "영화 '아마데우스' (1984)", "한국 조수미 등 성악가 출연 CF", "영화 '가이트 포 더 트루' (2021)"],
    "모차르트 터키행진곡(Mozart Turkish March)": ["한국 영화 '트루먼 쇼' (1998)", "다수의 한국 가전제품 광고 (세탁기 완료음 등)", "영화 '피아노의 숲'"],
    "모차르트 피아노 소나타 16번 K.545 1악장(Mozart Piano Sonata No. 16 in C Major, K.545 1st. mov)": ["한국 피아노 학원 관련 CF 다수", "영화 '트루먼 쇼' (1998)"],
    "바흐 무반주 첼로 모음곡 1번(Bach Suite for Solo Cello No. 1 in G Major)": ["영화 '마스터 앤드 커맨더' (2003)", "영화 '유로트립' (2004)", "다수의 한국 다큐멘터리 BGM"],
    "바흐 관현악 모음곡 3번 g선상의 아리아(Bach Orchestral Suite No.3 in D Major, Air on the G String)": ["한국 영화 '접속' (1997)", "영화 '에반게리온: 엔드 오브 에반게리온' (1997)", "영화 '세븐' (1995)", "다수의 고요한 새벽 배경 CF"],
    "바흐 토카타와 푸가 D단조(Bach Toccata and Fugue in D Minor)": ["영화 '환타지아' (1940)", "영화 '2 해저 2만리' (1954)", "드라큘라/공포/할로윈 관련 예능 및 CF"],
    "베르디 아이다 중 개선행진곡(Verdi Aida, 'Grand March')": ["한국 각종 스포츠 대회 시상식", "졸업식 및 축하 행사 BGM"],
    "베르디 리골레토 중 여자의 마음(Verdi Rigoletto, 'La Donna E Mobile')": ["한국 하이마트 TV CF (하이마트로 가요~)", "영화 '대부 3' (1990)", "한국 피자/이탈리안 레스토랑 광고 다수"],
    "베르디 라 트라비아타 중 축배의 노래(Verdi La Traviata, 'Libiamo, ne' lieti calici')": ["한국 샴페인/주류/파티 관련 다수의 광고 및 예능", "영화 '스포트라이트' (2015)", "영화 '스파이더맨 2' (2004)"],
    "베토벤 교향곡 5번 C단조(Beethoven Symphony No.5 in C Minor, Op.67)": ["드라마 '베토벤 바이러스' (2008)", "한국 의약품 광고 (운명적인 순간)", "영화 '킹스 스피치' (2010)", "영화 '심슨 가족 더 무비' (2007)"],
    "베토벤 교향곡 9번 D단조(Beethoven Symphony No.9 in D Minor, Op.125)": ["영화 '시계태엽 오렌지' (1971)", "영화 '다이 하드' (1988)", "영화 '이퀼리브리엄' (2002)", "기독교 찬송가 '기뻐하며 경배하세'"],
    "베토벤 엘리제를 위하여(Beethoven Bagatelle No. 25 in A minor)": ["한국 트럭 후진 경고음", "전화기 보류음", "영화 '불멸의 연인' (1994)", "영화 '바스터즈: 거친 녀석들' (2009)"],
    "브람스 자장가(Brahms Wiegenlied Op. 49 No. 4)": ["한국 유아용품 및 분유 CF", "오르골 BGM", "영화 '트루먼 쇼' (1998)"],
    "브람스 헝가리 무곡 5번 G단조(Brahms Hungarian Dances No.5 in G Minor)": ["한국 영화 '아저씨' (2010)", "영화 '위대한 독재자' (1940)", "한국 라면 및 식품 광고 BGM"],
    "비발디 사계 중 봄 1악장(Vivaldi The Four Seasons, Spring, 1st. mov)": ["한국 아파트/가전제품 등 다수의 봄 시즌 CF", "백화점 BGM"],
    "비발디 사계 중 겨울 1악장(Vivaldi The Four Seasons, Winter, 1st. mov)": ["한국 드라마 'SKY 캐슬' (2018) 메인 테마 급 활용", "영화 '올드보이' (2003)", "영화 '존 윅 3' (2019)"],
    "비발디 사계 중 여름 3악장(Vivaldi The Four Seasons, Summer, 3rd. mov)": ["한국 자동차 CF 및 긴장감 넘치는 예능 프로그램 BGM", "영화 '타오르는 여인의 초상' (2019)"],
    "비제 카르멘 서곡(Bizet Carmen - Ouverture)": ["영화 '배드 뉴스 베어즈' (1976)", "다수의 레이싱 및 스포츠 관련 광고"],
    "비제 카르멘 중 '하바네라'(Bizet Carmen, 'Habanera')": ["한국 화장품 CF (치명적 매력 강조)", "영화 '업' (2009)", "영화 '트레인스포팅' (1996)", "한국 커피 브랜드 광고"],
    "사라사테 지고이네르바이젠(Sarasate Zigeunerweisen, Op.20)": ["한국 예능 프로그램 좌절/절망/분노 씬 단골 BGM", "영화 '쿵푸 허슬' (2004)"],
    "생상스 죽음의 무도(Saint-Saëns Danse Macabre, Op.40)": ["한국 김연아 피겨스케이팅 쇼트 프로그램 (2008-2009 시즌)", "드라마 '펜트하우스' (2020)"],
    "쇼스타코비치 재즈 모음곡 2번 - 왈츠(Shostakovich Jazz Suite No.2 - Waltz)": ["한국 영화 '번지점프를 하다' (2001)", "영화 '아이즈 와이드 셧' (1999)", "영화 '님포매니악' (2013)", "한국 아파트 브랜드 광고"],
    "쇼팽 녹턴 2번(Chopin Nocturne Op.9 No.2)": ["드라마 '밀회' (2014)", "영화 '피아니스트' (2002)", "영화 '나쁜 산타' (2003)", "드라마 '덱스터' (2006)"],
    "쇼팽 왈츠 6번 '강아지 왈츠'(Chopin Waltz in D Flat major, Op. 64 No. 1)": ["다수의 반려동물 관련 한국 예능 및 CF"],
    "쇼팽 즉흥환상곡(Chopin Fantaisie Impromptu Op. 66)": ["한국 드라마 '천국의 계단' (2003)", "한국 드라마 '피아노' (2001)", "다수의 피아노 콩쿠르 소재 미디어"],
    "슈만 즐거운 농부(Schumann Frohliche Landmann)": ["한국 어린이 프로그램 및 우유/농산물 CF BGM"],
    "슈만 어린이정경 중 트로이메라이(Schumann Kinderszenen Op.15 No.7, 'Traumerei')": ["한국 영화 '호로비츠를 위하여' (2006)"],
    "슈베르트 피아노 오중주 '송어'(Schubert Piano Quintet in A major, 'The Trout')": ["한국 삼성전자 하우젠 에어컨 CF (김연아 출연)", "영화 '셜록 홈즈: 그림자 게임' (2011)", "세탁기 및 세제 CF 다수"],
    "슈트라우스 1세 라데츠키 행진곡(Strauss I Radetzky March)": ["빈 신년 음악회 앵콜곡", "다수의 경쾌한 행사 및 CF (자동차, 음료수)", "전 세계 대학교/졸업식 BGM"],
    "슈트라우스 2세 아름답고 푸른 도나우(Strauss II The Blue Danube Waltz)": ["영화 '2001 스페이스 오디세이' (1968)", "영화 '트루 라이즈' (1994)", "한국 대한항공 등 여행/우아한 항공사 광고"],
    "리하르트 슈트라우스 차라투스트라는 이렇게 말했다(Richard Strauss Also sprach Zarathustra)": ["영화 '2001 스페이스 오디세이' (1968)", "영화 '월-E' (2008)", "한국 우주/장엄한 등장씬 관련 예능/다큐 BGM 다수"],
    "스메타나 나의 조국 중 몰다우(Smetana Ma Vlast, 'Moldau')": ["영화 '트리 오브 라이프' (2011)", "한국 자연/관광 관련 다큐멘터리 BGM"],
    "엘가 사랑의 인사(Elgar Salut d'Amour Op.12)": ["한국 영화 '8월의 크리스마스' (1998)", "다수의 웨딩, 쥬얼리 및 로맨틱 한국 광고"],
    "엘가 위풍당당 행진곡(Elgar Pomp and Circumstance March No.1)": ["한국 시몬스 침대 광고", "영화 '킹스맨: 시크릿 에이전트' (2014) 클라이맥스 폭발씬", "미국 및 전 세계 대학교 졸업식 BGM"],
    "오르프 카르미나 부라나 중 오! 운명의 여신이여(Orff Carmina Burana, 'O fortuna')": ["한국 드라마 '펜트하우스' (2020-2021)", "영화 '엑스칼리버' (1981)", "다수의 장엄하고 압도적인 스케일의 예능, 게임 BGM", "마이클 잭슨 댄저러스 투어 오프닝"],
    "오펜바흐 지옥의 오르페우스 서곡 (캉캉)(Offenbach Orpheus In the Underworld - Overture 'Can Can')": ["한국 코믹 예능 운동회/달리기/슬랩스틱 씬 단골 BGM", "영화 '물랑 루즈' (2001)"],
    "조플린 엔터테이너(Joplin The Entertainer)": ["영화 '스팅' (1973)", "다수의 한국 경쾌한 일상 CF", "게임/놀이동산 관련 광고"],
    "차이콥스키 1812년 서곡(Tchaikovsky 1812 Overture)": ["영화 '브이 포 벤데타' (2005)", "다수의 축제/불꽃놀이 BGM"],
    "차이콥스키 백조의 호수 중 정경(Tchaikovsky Swan Lake, 'Scene')": ["영화 '블랙 스완' (2010)", "영화 '빌리 엘리어트' (2000)", "유니버설 스튜디오 영화 로고 BGM (드라큘라 등)", "한국 화장품 광고"],
    "차이콥스키 피아노 협주곡 1번 1악장(Tchaikovsky Piano Concerto No. 1, Op. 23 1st. mov)": ["영화 '미저리' (1990)", "다수의 웅장한 클래식 콩쿠르 영화", "한국 자동차 보험 CF"],
    "크라이슬러 아름다운 로즈마린(Kreisler Schon Rosmarin, Op.55)": ["한국 화장품, 샴푸 등 여성적인 CF BGM"],
    "파가니니 카프리스 24번(Paganini Caprice for Solo Violin in A Minor, Op. 1 No. 24)": ["영화 '파가니니: 악마의 바이올리니스트' (2013)", "한국 기교적/천재적 인물을 나타내는 다큐멘터리 BGM"],
    "파헬벨 캐논(Pachelbel Canon in D Major)": ["한국 영화 '엽기적인 그녀' (2001) (전지현 피아노 씬)", "한국 영화 '클래식' (2003)", "영화 '보통 사람들' (1980)", "한국 결혼식 입장곡"],
    "푸치크 검투사의 입장(Fučík Entry of the Gladiators)": ["서커스, 피에로 등장 등 전 세계적 서커스 BGM", "한국 코믹/바보 연기, 우스꽝스러운 실수 씬 예능 단골 BGM"],
    "프로코피예프 로미오와 줄리엣 중 기사들의 춤(Prokofiev Romeo and Juliet, 'Dance of the Knights')": ["영화 '칼리굴라' (1979)", "다수의 위압적인 보스/적 등장 씬 BGM", "미국 리얼리티 쇼 '어프렌티스'"],
    "하이든 놀람교향곡 2악장(Haydn Symphony No. 94 in G Major, 2nd. mov)": ["다수의 코믹 스텔스/살금살금 걷는 씬 한국 예능 BGM"],
    "헨델 메시아 중 할렐루야(Händel Messiah, 'Hallelujah Chorus')": ["다수의 깨달음/환희의 순간을 표현하는 한국 예능 BGM (머리 위 전구 켜질 때)", "영화 '덤 앤 더머' (1994)"],
    "홀스트 행성모음곡 중 목성(Holst The Planets, 'Jupiter')": ["가수 히라하라 아야카의 노래 'Jupiter'", "영화 '보이후드' (2014)", "우주/행성 관련 다큐멘터리 단골 BGM"],
    "라흐마니노프 피아노 협주곡 2번 C단조 Op. 18(Rahmaninov Piano Concerto No.2 in C minor Op. 18)": ["한국 드라마 '밀회' (2014)", "일본 드라마 '노다메 칸타빌레' (2006)", "한국 영화 '호로비츠를 위하여' (2006)", "영화 '7년만의 외출' (1955)"],
    "라흐마니노프 피아노 협주곡 3번 D단조 Op. 30(Rahmaninov Piano Concerto No. 3 in D minor Op. 30)": ["영화 '샤인' (1996)", "드라마 '밀회' (2014)"],
    "마스카니 카발레리아 루스티카나 중 간주곡(Mascagni Cavalleria rusticana, Intermezzo)": ["영화 '대부 3' (1990)", "영화 '성난 황소' (1980)", "한국 SK텔레콤 등 다수의 통신사/기업 PR CF"],
    "마스네 타이스 중 '명상곡'(Massenet Thais, 'Meditation')": ["한국 영화 '클래식' (2003)", "드라마 '내일도 칸타빌레' (2014)"],
    "바그너 니벨룽겐의 반지 중 발키리의 기행(Wagner The Ring of the Nibelung - Ride of the Valkyries)": ["영화 '지옥의 묵시록' (1979)", "다수의 전쟁/진격/헬기 등장 씬 BGM", "영화 '블루스 브라더스' (1980)"],
    "베르디 일 트로바토레 중 대장간의 합창(Verdi Il Trovatore - Anvil Chorus)": ["한국 자동차 CF (힘/엔진 강조)", "망치질/공장/노동 관련 예능 BGM"],
    "베토벤 피아노 소나타 8번 비창 2악장, 3악장(Beethoven Piano Sonata No.8 in C minor ‘Pathétique’ 2nd, 3rd. mov)": ["한국 드라마 '베토벤 바이러스' (2008)", "한국 영화 '친절한 금자씨' (2005)", "다수의 슬프거나 격정적인 CF BGM"],
    "베토벤 피아노 소나타 14번 월광 3악장(Beethoven Piano Sonata No.14 'Moonlight' 3rd. mov)": ["애니메이션 '명탐정 코난: 피아노 소나타 '월광' 살인사건'", "영화 '피아니스트' (2002)"],
    "생상스 동물의 사육제 중 제13곡 '백조'(Saint-Saëns Le Carnaval des animaux, XIII. 'Le cygne')": ["한국 영화 '말아톤' (2005)", "영화 '빌리 엘리어트' (2000)", "한국 정수기 등 순수함 강조 CF"],
    "세느비유 아드린느를 위한 발라드(Senneville Ballade Pour Adeline)": ["다수의 90년대 한국 로맨틱 드라마 BGM", "전국 피아노 학원의 단골 콩쿠르/연주회 곡"],
    "쇼팽 에튀드 Op.10 No.12 '혁명'(Chopin Etude Op. 10 No. 12 'Revolutionary')": ["한국 드라마 '천국의 계단' (2003)", "한국 드라마 '베토벤 바이러스' (2008)"],
    "쇼팽 에튀드 Op. 10 No. 3 '이별의 곡'(Chopin Etude in E major, Op. 10 No. 3 'Tristesse')": ["영화 '이별의 곡' (1934)", "애니메이션 '강철의 연금술사' 극장판", "한국 화장품 광고"],
    "슈베르트 세레나데(Schubert Serenade)": ["한국 영화 '클래식' (2003)", "한국 아파트 및 우아한 분위기 CF 다수"],
    "폰키엘리 지오콘다 중 시간의 춤(Ponchielli La Gioconda - Dance of the Hours)": ["애니메이션 '환타지아' (1940) 하마와 악어의 발레 씬", "한국 시계/시간 관련 광고"],
    "피아졸라 리베르탱고(Piazzolla Libertango)": ["한국 김연아 피겨스케이팅 프로그램", "한국 드라마 '베토벤 바이러스' (2008)", "다수의 탱고/관능적인 방송 씬 BGM"],
    "피아졸라 아디오스 노니노(Piazzolla Adiós Nonino)": ["한국 김연아 피겨스케이팅 프리 프로그램 (2013-2014 소치 올림픽)"],
    "하차투리안 가이느 중 칼의 춤(Khachaturian Gayaneh - Sabre Dance)": ["한국 예능 프로그램 바쁘게 움직이거나 혼란스러운 씬 단골 BGM", "서커스 및 곡예 관련 전 세계 BGM"],
    "헨델 솔로몬 중 시바여왕의 도착(Händel Solomon - Arrival of Queen of Sheba)": ["2012년 런던 올림픽 개막식 007 제임스 본드 등장씬"],
    "도니제티 사랑의 묘약 중 '남 모르게 흐르는 눈물'(Donizetti L'elisir d'amore, 'Una Furtiva Lagrima')": ["영화 '매치 포인트' (2005)", "다수의 한국 커피 CF 및 슬픈 독백 씬"],
    "푸치니 토스카 중 '별은 빛나건만'(Puccini Tosca, 'E lucevan le stelle')": ["드라마 '펜트하우스' (2020-2021)"],
    "푸치니 투란도트 중 '아무도 잠들지 마라'(Puccini Turandot, 'Nessun Dorma')": ["한국 KTF '쇼(SHOW)' 광고", "영화 '미션 임파서블: 로그 네이션' (2015)", "영국 폴 포츠 오디션 우승곡", "드라마 '펜트하우스' (2020)"],
    "바그너 탄호이저 서곡(Wagner Tannhauser Overture)": ["영화 '지옥의 묵시록' (1979)"],
    "사티 짐노페디 1번(Satie Gymnopedie No.1)": ["한국 가구(일룸 등) 및 침대 광고", "영화 '마이 래트' (2003)", "다수의 화장품 CF"],
    "포레 파반느(Fauré Pavane, Op.50)": ["한국 고급 승용차 광고 다수", "영화 '도플갱어' (2003)"],
    "드뷔시 아라베스크 1번(Debussy Arabesque No.1)": ["영화 '릴리 슈슈의 모든 것' (2001)", "다수의 한국 화장품 및 향수 CF"],
    "라흐마니노프 프렐류드 Op.23 No.5(Rahmaninov Prelude Op. 23 No. 5 in G minor)": ["영화 '라흐마니노프' (2007)"],
    "거슈윈 파리의 미국인(Gershwin An American in Paris)": ["영화 '파리의 미국인' (1951)", "한국 항공사 파리 취항 CF"],
    "드뷔시 교향시 '바다'(Debussy Symphonic poem ‘La mer’)": ["한국 자연 다큐멘터리 해양 씬 BGM", "영화 '바다' (2011)"],
    "바흐 평균율 클라비어 곡집 1권 중 제1번(Bach The Well Tempered Clavier, Book 1, 1.Prelude in C Major)": ["영화 '바그다드 카페' (1987) Calling you 원곡 모티프", "다수의 잔잔한 명상/아침 CF"],
    "타레가 알함브라 궁전의 추억(Tárrega Recuerdos De La Alhambra)": ["한국 드라마 '알함브라 궁전의 추억' (2018)", "영화 '킬링 필드' (1984) (편곡판 Etude)", "한국 다수의 스페인 관광 CF"]
}

directory = r"d:\github\ultra-office\public\classic"
json_files = glob.glob(os.path.join(directory, "highlight*.json"))

updated_count = 0
for file_path in json_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        modified = False
        for title, info in data.items():
            if title in ost_mapping:
                if "OST" not in info:
                    info["OST"] = []
                
                # Append new osts if not already present
                for new_ost in ost_mapping[title]:
                    if new_ost not in info["OST"]:
                        info["OST"].append(new_ost)
                        modified = True
                        updated_count += 1
                        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print(f"Successfully updated {updated_count} OST entries.")

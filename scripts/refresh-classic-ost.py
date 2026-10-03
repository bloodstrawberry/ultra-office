"""Rebuild the sourced OST entries in the 400-song classic catalog.

Run from the repository root: python -X utf8 scripts/refresh-classic-ost.py
Entries are keyed by their one-based catalog number. The title checks below
protect against accidentally attaching a film to a reordered song.
"""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "public" / "classic"
DATA_PATH = ROOT / "classic.json"

FANTASIA = "https://www.imdb.com/title/tt0032455/soundtrack/"
FANTASIA_2000 = "https://www.imdb.com/title/tt0120910/soundtrack/"
AMADEUS = "https://www.imdb.com/title/tt0086879/soundtrack/"
SHINE = "https://www.imdb.com/title/tt0117631/soundtrack/"
PIANIST = "https://www.imdb.com/title/tt0253474/soundtrack/"
CLOCKWORK = "https://www.imdb.com/title/tt0066921/soundtrack/"
KINGS_SPEECH = "https://www.imdb.com/title/tt1504320/soundtrack/"
ODYSSEY = "https://www.watertower-music.com/release/2001-a-space-odyssey-music-from-the-motion-picture/"
ENDEAVOUR = "https://morseandlewisandendeavour.com/wp-content/uploads/2022/08/Music-from-Endeavour-classical-19th-aug-2022-PDF.pdf"

# Each tuple: catalog number, title fragment, media title, evidence.
SOURCES = [
    (1, "가르델", "영화 《여인의 향기 / Scent of a Woman》(1992)", "https://www.youtube.com/watch?v=snAu5rqBxNE"),
    (1, "가르델", "영화 《쉰들러 리스트 / Schindler's List》(1993)", "https://holocaustmusic.ort.org/memory/holocaust-film/the-diegesis-of-schindlers-list/"),
    (1, "가르델", "영화 《트루 라이즈 / True Lies》(1994)", "https://www.imdb.com/title/tt0111503/soundtrack/"),
    (2, "랩소디 인 블루", "영화 《판타지아 2000 / Fantasia 2000》(1999)", FANTASIA_2000),
    (2, "랩소디 인 블루", "영화 《맨해튼 / Manhattan》(1979)", "https://www.youtube.com/watch?v=7mwZYGcbQCo"),
    (5, "산왕의 궁전", "영화 《소셜 네트워크 / The Social Network》(2010)", "https://www.imdb.com/title/tt1285016/soundtrack/"),
    (6, "아침의 기분", "광고 《Tesco Mobile: Wake Up Call》(2015)", "https://www.tvadmusic.co.uk/2015/08/tesco-mobile-wake-up-call/"),
    (10, "달빛", "영화 《오션스 일레븐 / Ocean's Eleven》(2001)", "https://www.youtube.com/watch?v=4wTD-jwmz5s"),
    (10, "달빛", "영화 《트와일라잇 / Twilight》(2008)", "https://www.imdb.com/title/tt1099212/soundtrack/"),
    (10, "달빛", "영화 《에브리씽 에브리웨어 올 앳 원스 / Everything Everywhere All at Once》(2022)", "https://www.imdb.com/title/tt6710474/soundtrack/"),
    (12, "볼레로", "영화 《텐 / 10》(1979)", "https://www.imdb.com/title/tt0078721/soundtrack/"),
    (12, "볼레로", "애니메이션 《디지몬 어드벤처: 우리들의 워 게임! / Our War Game!》(2000)", "https://www.youtube.com/watch?v=4ppNkVjg_S0"),
    (13, "세빌리아의 이발사", "애니메이션 《Rabbit of Seville》(1950)", "https://conjuntosantander.com/Programas-de-mano/Programa-BugsBunny-Nov2023.pdf"),
    (14, "윌리엄 텔", "TV 시리즈 《론 레인저 / The Lone Ranger》(1949)", "https://www.imdb.com/title/tt0635424/soundtrack/"),
    (16, "라 캄파넬라", "영화 《샤인 / Shine》(1996)", SHINE),
    (17, "왕벌의 비행", "영화 《샤인 / Shine》(1996)", SHINE),
    (19, "축혼 행진곡", "영화 《네 번의 결혼식과 한 번의 장례식 / Four Weddings and a Funeral》(1994)", "https://www.youtube.com/watch?v=ydEItbV_vV8"),
    (19, "축혼 행진곡", "영화 《런어웨이 브라이드 / Runaway Bride》(1999)", "https://www.imdb.com/title/tt0163187/soundtrack/"),
    (19, "축혼 행진곡", "영화 《나의 그리스식 웨딩 / My Big Fat Greek Wedding》(2002)", "https://www.imdb.com/title/tt0259446/soundtrack/"),
    (20, "밤의 여왕", "영화 《아마데우스 / Amadeus》(1984)", AMADEUS),
    (22, "터키행진곡", "영화 《트루먼 쇼 / The Truman Show》(1998)", "https://www.youtube.com/watch?v=GkohnyoPqhg"),
    (26, "무반주 첼로", "영화 《마스터 앤드 커맨더 / Master and Commander》(2003)", "https://www.youtube.com/watch?v=a6Ji-KDLG8Y"),
    (26, "무반주 첼로", "영화 《피아니스트 / The Pianist》(2002)", "https://www.imdb.com/title/tt0253474/soundtrack/"),
    (26, "무반주 첼로", "영화 《솔로이스트 / The Soloist》(2009)", "https://www.imdb.com/title/tt0824721/soundtrack/"),
    (28, "토카타와 푸가", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (31, "진노의 날", "영화 《배틀 로얄 / Battle Royale》(2000)", "https://www.imdb.com/title/tt0266308/soundtrack/"),
    (34, "축배의 노래", "영국 드라마 《엔데버 / Endeavour》(2014, 시즌 2 1화 'Trove')", ENDEAVOUR),
    (35, "교향곡 5번", "영화 《판타지아 2000 / Fantasia 2000》(1999)", FANTASIA_2000),
    (35, "교향곡 5번", "영화 《지상 최대의 작전 / The Longest Day》(1962)", "https://www.helloclassical.org/classical-music-in-film/"),
    (36, "교향곡 9번", "영화 《시계태엽 오렌지 / A Clockwork Orange》(1971)", CLOCKWORK),
    (36, "교향곡 9번", "영화 《다이 하드 / Die Hard》(1988)", "https://www.youtube.com/watch?v=ysd2r_-9dpE"),
    (36, "교향곡 9번", "한국 드라마 《베토벤 바이러스》(2008, 10회)", "https://enews.imbc.com/News/RetrieveNewsInfo/545"),
    (39, "보케리니", "영화 《레이디킬러 / The Ladykillers》(1955)", "https://www.imdb.com/title/tt0048281/soundtrack/"),
    (39, "보케리니", "영화 《위대한 독재자 / The Great Dictator》(1940)", "https://www.imdb.com/title/tt0032553/soundtrack/"),
    (41, "헝가리 무곡", "영화 《위대한 독재자 / The Great Dictator》(1940)", "https://www.imdb.com/title/tt0032553/soundtrack/"),
    (42, "봄 1악장", "영화 《마라톤 보이 / Ralph》(2004)", "https://www.imdb.com/title/tt0411802/soundtrack/"),
    (43, "여름 3악장", "광고 《Samsung Galaxy S4: Life Companion》(2013)", "https://www.tvadmusic.co.uk/2013/09/samsung-galaxy-s4-life-companion/"),
    (46, "겨울 1악장", "영화 《올드보이 / Oldboy》(2003)", "https://www.imdb.com/title/tt0364569/soundtrack/"),
    (46, "겨울 1악장", "영화 《존 윅 3: 파라벨룸 / John Wick: Chapter 3 - Parabellum》(2019)", "https://www.imdb.com/title/tt6146586/soundtrack/"),
    (52, "짐노페디", "영화 《로얄 테넌바움 / The Royal Tenenbaums》(2001)", "https://www.youtube.com/watch?v=oRZlASC2d6U"),
    (52, "짐노페디", "영국 드라마 《엔데버 / Endeavour》(2017, 시즌 4 1화 'Game')", ENDEAVOUR),
    (54, "쇼스타코비치", "영화 《아이즈 와이드 셧 / Eyes Wide Shut》(1999)", "https://www.youtube.com/watch?v=8t8l4GxZMM0"),
    (55, "쇼팽 녹턴 2번", "미국 드라마 《웨스트월드 / Westworld》(2016, 시즌 1 10화)", "https://www.imdb.com/title/tt5229638/soundtrack/"),
    (55, "쇼팽 녹턴 2번", "영국 드라마 《엔데버 / Endeavour》(2019, 시즌 6 3화 'Confection')", ENDEAVOUR),
    (62, "트로이메라이", "한국 드라마 《브람스를 좋아하세요?》(2020)", "https://m.ent.sbs.co.kr/news/article.do?article_id=E10010052687"),
    (67, "아름답고 푸른 도나우", "영화 《2001 스페이스 오디세이 / 2001: A Space Odyssey》(1968)", "https://www.youtube.com/watch?v=0ZoSYsNADtY"),
    (67, "아름답고 푸른 도나우", "영화 《하늘을 나는 용감한 남자들 / Those Magnificent Men in Their Flying Machines》(1965)", "https://www.imdb.com/title/tt0059797/soundtrack/"),
    (67, "아름답고 푸른 도나우", "애니메이션 영화 《랭고 / Rango》(2011)", "https://www.imdb.com/title/tt1192628/soundtrack/"),
    (68, "차라투스트라", "영화 《2001 스페이스 오디세이 / 2001: A Space Odyssey》(1968)", "https://www.youtube.com/watch?v=e-QFj59PON4"),
    (71, "위풍당당", "영화 《판타지아 2000 / Fantasia 2000》(1999)", FANTASIA_2000),
    (71, "위풍당당", "영화 《브래스드 오프 / Brassed Off》(1996)", "https://www.imdb.com/title/tt0115744/soundtrack/"),
    (71, "위풍당당", "영화 《킹스맨: 시크릿 에이전트 / Kingsman: The Secret Service》(2014)", "https://www.imdb.com/title/tt2802144/soundtrack/"),
    (72, "운명의 여신", "영화 《엑스칼리버 / Excalibur》(1981)", "https://www.youtube.com/watch?v=t6Hp2WANepc"),
    (73, "지옥의 오르페우스", "영화 《하늘을 나는 용감한 남자들 / Those Magnificent Men in Their Flying Machines》(1965)", "https://www.imdb.com/title/tt0059797/soundtrack/"),
    (75, "엔터테이너", "영화 《스팅 / The Sting》(1973)", "https://catalog.afi.com/Film/54391-THE-STING"),
    (77, "1812년 서곡", "영화 《브이 포 벤데타 / V for Vendetta》(2005)", "https://www.youtube.com/watch?v=D9gYhnUKehU"),
    (79, "백조의 호수", "영화 《블랙 스완 / Black Swan》(2010)", "https://www.imdb.com/title/tt0947798/soundtrack/"),
    (81, "꽃의 왈츠", "영화 《판타지아 / Fantasia》(1940)", "https://www.youtube.com/watch?v=Hs35GIdpNDU"),
    (82, "트레팍", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (83, "사탕요정", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (84, "중국인의 춤", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (92, "파헬벨", "영화 《보통 사람들 / Ordinary People》(1980)", "https://catalog.afi.com/Film/56483-ORDINARY-PEOPLE"),
    (95, "기사들의 춤", "TV 시리즈 《어프렌티스 / The Apprentice》(2005)", "https://www.classical-music.com/features/tv-and-film-music/apprentice-theme-tune"),
    (101, "꼭두각시", "TV 시리즈 《Alfred Hitchcock Presents》(1955)", "https://www.hitchcockwiki.com/wiki/Alfred_Hitchcock_Show"),
    (103, "마법사의 제자", "영화 《판타지아 / Fantasia》(1940)", "https://www.youtube.com/watch?v=Rrm8usaH0sM"),
    (103, "마법사의 제자", "영화 《마법사의 제자 / The Sorcerer's Apprentice》(2010)", "https://filmmusic.com/movie/the-sorcerers-apprentice-2010/"),
    (105, "드뷔시 꿈", "미국 드라마 《웨스트월드 / Westworld》(2016, 시즌 1)", "https://www.imdb.com/title/tt4630546/soundtrack/"),
    (108, "피아노 협주곡 2번", "영화 《밀회 / Brief Encounter》(1945)", "https://www.youtube.com/watch?v=hubyFqSUaGA"),
    (109, "피아노 협주곡 3번", "영화 《샤인 / Shine》(1996)", SHINE),
    (112, "헝가리 광시곡 2번", "애니메이션 《Rhapsody Rabbit》(1946)", "https://mathcs.holycross.edu/~groberts/Courses/Mont2/Handouts/CD1.pdf"),
    (112, "헝가리 광시곡 2번", "애니메이션 《The Cat Concerto》(1947)", "https://www.imdb.com/title/tt0039251/trivia/"),
    (113, "보기 대령", "영화 《콰이 강의 다리 / The Bridge on the River Kwai》(1957)", "https://www.imdb.com/title/tt0050212/soundtrack/"),
    (119, "라크리모사", "영화 《아마데우스 / Amadeus》(1984)", AMADEUS),
    (119, "라크리모사", "영국 드라마 《엔데버 / Endeavour》(2014, 시즌 2 3화 'Sway')", ENDEAVOUR),
    (120, "마술피리 서곡", "영화 《아마데우스 / Amadeus》(1984)", AMADEUS),
    (121, "피가로의 결혼 서곡", "영화 《킹스 스피치 / The King's Speech》(2010)", KINGS_SPEECH),
    (122, "피아노 협주곡 21번", "영화 《엘비라 마디간 / Elvira Madigan》(1967)", "https://www.imdb.com/title/tt0061620/soundtrack/"),
    (122, "피아노 협주곡 21번", "영화 《나를 사랑한 스파이 / The Spy Who Loved Me》(1977)", "https://www.helloclassical.org/classical-music-in-film/"),
    (123, "민둥산", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (125, "발키리의 기행", "영화 《지옥의 묵시록 / Apocalypse Now》(1979)", "https://www.youtube.com/watch?v=VE03Lqm3nbI"),
    (125, "발키리의 기행", "영화 《왓치맨 / Watchmen》(2009)", "https://www.youtube.com/watch?v=Ox0LHICe9Qc"),
    (125, "발키리의 기행", "영화 《하늘을 나는 용감한 남자들 / Those Magnificent Men in Their Flying Machines》(1965)", "https://www.imdb.com/title/tt0059797/soundtrack/"),
    (125, "발키리의 기행", "애니메이션 영화 《랭고 / Rango》(2011)", "https://www.imdb.com/title/tt1192628/soundtrack/"),
    (134, "교향곡 7번", "영화 《킹스 스피치 / The King's Speech》(2010)", "https://www.youtube.com/watch?v=PPLIw64rLJc"),
    (135, "교향곡 9번", "영화 《시계태엽 오렌지 / A Clockwork Orange》(1971)", "https://www.helloclassical.org/classical-music-in-film/"),
    (135, "교향곡 9번", "영국 드라마 《엔데버 / Endeavour》(2019, 시즌 6 1화 'Pylon')", ENDEAVOUR),
    (137, "비창", "영화 《그 남자는 거기 없었다 / The Man Who Wasn't There》(2001)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/most-iconic-uses-classical-music-soundtrack/"),
    (173, "봄의 제전", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (179, "갈대피리", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (188, "시간의 춤", "영화 《판타지아 / Fantasia》(1940)", FANTASIA),
    (200, "시바여왕", "영화 《네 번의 결혼식과 한 번의 장례식 / Four Weddings and a Funeral》(1994)", "https://www.imdb.com/title/tt0109831/soundtrack/"),
    (212, "제18변주", "영화 《사랑의 은하수 / Somewhere in Time》(1980)", "https://www.imdb.com/title/tt0081534/soundtrack/"),
    (213, "프렐류드 Op.3", "영화 《샤인 / Shine》(1996)", SHINE),
    (213, "프렐류드 Op.3", "영국 드라마 《엔데버 / Endeavour》(2016, 시즌 3 4화 'Coda')", ENDEAVOUR),
    (223, "탄식", "영화 《샤인 / Shine》(1996)", SHINE),
    (224, "헌정", "한국 드라마 《브람스를 좋아하세요?》(2020, 16회)", "https://news.sbs.co.kr/news/endPage.do?news_id=N1006077415"),
    (227, "카발레리아", "영화 《분노의 주먹 / Raging Bull》(1980)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/most-iconic-uses-classical-music-soundtrack/"),
    (227, "카발레리아", "영화 《대부 3 / The Godfather Part III》(1990)", "https://www.imdb.com/title/tt0099674/soundtrack/"),
    (227, "카발레리아", "미국 드라마 《소프라노스 / The Sopranos》(2007, 시즌 6 20화)", "https://letraslibres.com/revista-espana/toro-salvaje-secuencia-de-creditos/"),
    (230, "말러 교향곡 5번", "영화 《베니스에서의 죽음 / Death in Venice》(1971)", "https://www.youtube.com/watch?v=RfRZT6Vw_wE"),
    (230, "말러 교향곡 5번", "영화 《타르 / Tár》(2022)", "https://www.imdb.com/title/tt14444726/soundtrack/"),
    (230, "말러 교향곡 5번", "영국 드라마 《엔데버 / Endeavour》(2020, 시즌 7 1화 'Oracle', 아다지에토)", ENDEAVOUR),
    (234, "편지의 이중창", "영화 《쇼생크 탈출 / The Shawshank Redemption》(1994)", "https://www.youtube.com/watch?v=Bjqmg_7J53s"),
    (249, "열정", "한국 드라마 《밀회》(2014, 2회)", "https://tv.jtbc.co.kr/photo/pr10010292/pm10023246/detail/4139"),
    (250, "브람스 바이올린 협주곡", "영화 《데어 윌 비 블러드 / There Will Be Blood》(2007)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/most-iconic-uses-classical-music-soundtrack/"),
    (261, "녹턴 20번", "영화 《피아니스트 / The Pianist》(2002)", PIANIST),
    (262, "발라드 1번", "영화 《피아니스트 / The Pianist》(2002)", PIANIST),
    (268, "프렐류드 4번", "영화 《파이브 이지 피시즈 / Five Easy Pieces》(1970)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/most-iconic-uses-classical-music-soundtrack/"),
    (269, "빗방울", "영화 《샤인 / Shine》(1996)", SHINE),
    (269, "빗방울", "영국 드라마 《더 크라운 / The Crown》(2019, 시즌 3)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/the-crown-season-3-soundtrack-music-songs/"),
    (274, "피아노 3중주", "영화 《배리 린든 / Barry Lyndon》(1975)", "https://www.imdb.com/title/tt0072684/soundtrack/"),
    (275, "불새", "영화 《판타지아 2000 / Fantasia 2000》(1999)", FANTASIA_2000),
    (277, "핀란디아", "영화 《다이 하드 2 / Die Hard 2》(1990, 선율 인용)", "https://www.michaelkamen.com/catalogue/die-hard-2"),
    (296, "아무도 잠들지", "영화 《미션 임파서블: 로그 네이션 / Mission: Impossible – Rogue Nation》(2015)", "https://www.classicfm.com/discover-music/periods-genres/film-tv/most-iconic-uses-classical-music-soundtrack/"),
    (301, "파리의 미국인", "영화 《파리의 미국인 / An American in Paris》(1951)", "https://gershwin.com/publications/an-american-in-paris-concert-work/"),
    (310, "남 모르게", "영화 《매치 포인트 / Match Point》(2005)", "https://www.imdb.com/title/tt0416320/soundtrack/"),
    (337, "브람스 교향곡 1번", "영화 《굿바이 어게인 / Goodbye Again》(1961, 선율 편곡)", "https://catalog.afi.com/Film/23100-GOODBYE-AGAIN"),
    (339, "브람스 교향곡 3번", "영화 《굿바이 어게인 / Goodbye Again》(1961, 선율 편곡)", "https://catalog.afi.com/Film/23100-GOODBYE-AGAIN"),
    (347, "오르간", "영화 《꼬마 돼지 베이브 / Babe》(1995, 선율 편곡)", "https://www.imdb.com/title/tt0112431/soundtrack/"),
    (348, "수족관", "영화 《천국의 나날들 / Days of Heaven》(1978)", "https://www.imdb.com/title/tt0077405/soundtrack/"),
    (353, "피아노 협주곡 2번", "영화 《판타지아 2000 / Fantasia 2000》(1999)", FANTASIA_2000),
    (366, "미완성", "영화 《마이너리티 리포트 / Minority Report》(2002)", "https://www.youtube.com/watch?v=2l_IUAcvfv8"),
]


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    titles = list(data)
    if len(titles) != 400:
        raise ValueError(f"Expected 400 songs, found {len(titles)}")
    for position, title in enumerate(titles, 1):
        if data[title]["번호"] != f"{position:03}":
            raise ValueError(f"Catalog number mismatch at {position:03}: {title!r}")
        data[title].pop("OST", None)

    for position, fragment, work, url in SOURCES:
        title = titles[position - 1]
        if fragment not in title:
            raise ValueError(f"Title mismatch: {position:03}: {title!r}")
        entries = data[title].setdefault("OST", [])
        if any(entry["작품"] == work for entry in entries):
            raise ValueError(f"Duplicate media title: {position:03}: {work}")
        entries.append({"작품": work, "근거": url})

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Audited {len(data)} songs; saved {len(SOURCES)} sourced uses")


if __name__ == "__main__":
    main()

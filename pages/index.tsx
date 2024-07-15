import { useEffect, useState } from "react";

import { Seo } from "@components/atoms";
import { InstagramPost } from "@components/molecules";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import { useMedia } from "@lib/utils/useMedia";
import PAGE_TYPES from "constants/pageTypes";
import { GetStaticPropsResult } from "next";
// import { useRouter } from "next/router";
import styled from "styled-components";

type THomepage = {
  page: TPageFields;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  return {
    props: {
      page,
    },
    revalidate: 60,
  };
}

export default function Home({ page }: THomepage) {
  const { isMobile, isTablet } = useMedia();

  const [igData, setIgData] = useState<any>(null);
  // const [ enabled, setEnabled ] = useState(false)
  const [userState, setUserState] = useState<any>(null);
  // const {push} = useRouter()

  /* const setupInsta = () => {
    const appId = '785220683818036';
    const redUri = 'https://www.google.com/'
    const url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redUri}&scope=user_profile,user_media&response_type=code`
    push(url)
  }

  const ACCESS_TOKEN_Andrea = "AQCL0c1UgsQeQ4cUhfTkfQoxUafwIHBA8UFDOXLSku9yKsPVhnEXDQYXPkEWKjWFiQalW0IZ0lTIZdaWH-KGvO5orGUtWnKuE6Z8ypPz2SYy5u4d--P8U54gOLLNpSfHy1FAlgtufOwIcQC1MFaNmZzVBdeUYyYbbukEYmvQdj8h1R_9W5M6axwPcmpR_zITFojDnMGT6Sp3mO5DYMvES0-S15stO6cC0U15tmomotocvQ#_"

  const accessToken_Alice = 'AQD83WoDO6d59P25KV2sZ3JW5yaYpYSs8esfME4KH8c7LfWIf6B-OWU2NnDqIqx6Oo_2O8ZbwI-By-zmagxCBwvucT2egzw8KvGcIjTXAF_dX-oHyymgouk0OvfvMzQv55E0nzPKuOCNyNohsBLcEKUjel2rN6MPBLrol3oMHy6OdmZEkCOtwW8uS6SdbKtHfckPWT3zZj_3hp5sQjXpgvB90mUVevk2ifL_Bhj8U9aG-Q#_'
 */
  /* useEffect(()=> {
    if (!enabled)
    fetch(`api/get-ig-access-token?code=${accessToken_Alice}`)
    .then((response) => response.json())
    .then((data) => {
      const igData = { 
        userName: data.username,
        longAccessToken: data.longAccessToken,
        id: data.id,
      }
      localStorage.setItem('igData', JSON.stringify(igData))
      setUserState(data as any)
    })
  },[enabled]) */

  useEffect(() => {
    if (userState && userState.longAccessToken !== "") {
      fetch(
        `api/get-instagram-media?longAccessToken=${userState.longAccessToken}`,
      )
        .then((response) => response.json())
        .then(({ data }) => {
          setIgData(data);
        });
    }
  }, [userState]);

  useEffect(() => {
    if (window && window.localStorage && !userState) {
      const igData = localStorage.getItem("igData");

      if (igData) {
        setUserState(JSON.parse(igData));
      }
    }
  }, [userState]);

  const column = isMobile ? 2 : isTablet ? 3 : 5;

  const [hovered, setHovered] = useState(-1);

  let gridTemplateColumns = `repeat(${column}, ${100 / column}fr)`;

  const group1 = [1, 6, 11, 16, 21];
  const group2 = [2, 7, 12, 17, 22];
  const group3 = [3, 8, 13, 18, 23];
  const group4 = [4, 9, 14, 19, 24];
  const group5 = [5, 10, 15, 20, 25];

  if (group1.includes(hovered)) {
    gridTemplateColumns = `${100 / 4}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group2.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 4}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group3.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 4}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group4.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 4
    }fr ${100 / 6}fr`;
  } else if (group5.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 4}fr`;
  }

  return (
    <>
      <Seo seoDescription={page.seoDescription} seoTitle={page.seoTitle} />
      <Header />
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      {/* <button onClick={setupInsta}>Login Instagram</button>
      <button onClick={() => setEnabled(true)}>connect</button> */}

      <div style={{ height: "58.5px", width: "100%" }}></div>

      <StyledDiv
        style={{
          background: "white",
          borderTop: "3px solid white",
          display: "grid",
          gridTemplateColumns,
          gridRowGap: "3px",
          gridColumnGap: "3px",
          transition: "all .25s",
        }}
      >
        {igData &&
          igData.map((media: any, i: number) => {
            return (
              <InstagramPost
                style={{
                  ...(hovered !== -1 && {
                    opacity: hovered == i + 1 ? "1" : "0.75",
                  }),
                }}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(-1)}
                key={media.id}
                media={media}
              />
            );
          })}
      </StyledDiv>
      <Footer />
    </>
  );
}

const StyledDiv = styled.div``;

/* Este componente muestra la barra de navegacion responsiva la cual en su version de escritorio renderiza el logo de TLapps con el enrutamiento hacia la pagina de categorias,
el titulo de la pagina en que se encuentar el usuario, esta renderizada dinamicamente en relacion a la location del la url dada por la comparacion de `router.pathname` y router.`query.categorie` provenientes del hook `useRouter' actualizando mediante el hook useState `setTitle`,  y el logo de recorrido virtual con el enrutamiento hacia la pagina de recorrido virtual.
En su version menor a 768px muestra el logo de TLapps con la misma funcionalidad que en su version de escritorio y un dropdown menu el cual contiene al componente `sidebar`

Este componente toma las props desde las paginas: `categorias.js`, `[categoria]` y `[product]`
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { RxHamburgerMenu, RxHome } from "react-icons/rx";
import { RiCloseCircleLine } from "react-icons/ri";
import { CgSearchLoading } from "react-icons/cg";
import styles from "./Navbar.module.css";
import Search from "../Search/Search";

const NavBar = ({ product, products, categoriesFiltered }) => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [toggleSideBar, setToggleSideBar] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);

  /**
 Esta funcion filtra los productos que seran renderizados en el componente `Search.jsx` pasando el arreglo con los productos mediante la prop `input`.
 el parametro `value` esta vinculado a los parametros que vienen de la funcion `handleSearch()`*/
  const filter = (value) => {
    const results = products.filter((item) => {
      return (
        (value &&
          item &&
          item.name &&
          item.name.toUpperCase().includes(value.toUpperCase())) ||
        (value &&
          item &&
          item.codigo &&
          item.codigo.toUpperCase().includes(value.toUpperCase()))
      );
    });
    setResult(results);
  };

  const handleSearch = (value) => {
    setInput(value);
    filter(value);
  };

  useEffect(() => {
    if (router.pathname === "/categorias") {
      setTitle("Categorías");
    }
    if (router.pathname === "/categoria/[categoria]") {
      setTitle(` ${router.query.categoria}`);
    }
    if (router.pathname === "/producto/[product]") {
      setTitle(` ${product.category[0]}`);
    }
    if (router.pathname === "/recorridovirtual") {
      setTitle("Disfruta nuestro recorrido virtual");
    }
  }, [router, product]);

  return (
    <div className={styles.navbar_container}>
      <Link className={styles.navbar_container_logo} href="/categorias">
        <Image
          src="/logo.svg"
          alt="TL apps logo"
          width={180}
          height={180}
          priority
        />
      </Link>
      <div
        className={styles.navbar_container_title}
        onClick={() =>
          router.asPath.includes("/producto")
            ? router.push(`/categoria/${product.category}`)
            : null
        }
      >
        {title}
      </div>
      <div className={styles.navbar_container_btn}>
        {router.pathname === "/recorridovirtual" ? (
          <Link href="/ddeco/categorias">
            <Image
              className={styles.navbar_toggle_home_logo}
              src="/home.png"
              alt="Tlapps ddeco logo"
              width={150}
              height={80}
              priority
            />
          </Link>
        ) : (
          <Link href="/recorridovirtual">
            <Image
              className={styles.rvirtual}
              src="/rvirtual.svg"
              alt="recorrido virtual icon"
              width={220}
              height={220}
            />
          </Link>
        )}
      </div>
      <div className={styles.navbar_toggle}>
        <div className={styles.navbar_toggle_items}>
          <Link href="/categorias">
            <Image
              src="/logo.svg"
              alt="TL apps logo"
              width={150}
              height={150}
              priority
            />
          </Link>
          {/* Este apartado del componente se muestra cuando el ancho la pantalla es menor o igual 768px renderiza condicionalmente dependiendo de `router.pathname` ya sea el icono del dropdown menu o el icono para ir al recorrido virtual. La funcionalidad del abre y cierre del dropdown menu que muestra el componente `SideBar.jsx` esta dada por el hook useState `setToggleSideBar`  */}

          {router.pathname === "/recorridovirtual" ? (
                    <Link href="/categorias">
                    <Image
                      className={styles.navbar_toggle_home_logo}
                      src="/home.png"
                      alt="Tlapps ddeco logo"
                      width={100}
                      height={60}
                      priority
                    />
                  </Link>
          ) : toggleSideBar ? (
            <RiCloseCircleLine
              className="bsmenudown"
              size={40}
              color="var(--bg-blue)"
              onClick={() => setToggleSideBar(false)}
            />
          ) : (
            <RxHamburgerMenu
              size={40}
              color="var(--bg-blue)"
              onClick={() => setToggleSideBar(true)}
            />
          )}
          {toggleSideBar && (
            <div className={styles.sidebar_toggle}>
              <div className={styles.sidebar_toggle_rvirtual}>
                <Link href="/recorridovirtual">
                  <Image
                    src="/rvirtual.svg"
                    alt="recorrido virtual icon"
                    width={145}
                    height={145}
                    priority
                  />
                </Link>
              </div>
              <div className={styles.sidebar_toggle_search}>
                <input
                  type="search"
                  name="product"
                  placeholder="Buscar"
                  value={input}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <CgSearchLoading size={35} color="#270085" />
                <Search
                  result={result}
                  input={input}
                  setToggleSideBar={setToggleSideBar}
                />
              </div>
              <div className={styles.sidebar_toggle_categories_item}>
                <div className={styles.sidebar_toggle_categories_container}>
                  {categoriesFiltered
                    .map((item) => (
                      <div className={styles.category} key={item.id}>
                        <Link
                          href={`/categoria/${item.category}`}
                          onClick={() => setToggleSideBar(false)}
                        >
                          <div className={styles.category_name}>
                            {item.category}
                          </div>
                        </Link>
                        <Image
                          src={item.thumbImg}
                          width={35}
                          height={35}
                          alt="logo"
                          priority
                        />
                      </div>
                    ))
                    .reverse()}
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className={styles.navbar_toggle_title}
          onClick={() =>
            router.asPath.includes("/producto")
              ? router.push(`/categoria/${product.category}`)
              : null
          }
        >
          {title}
        </div>
      </div>
    </div>
  );
};

export default NavBar;

/**El componente `Categorías` toma como props, `categoriesFiltered` y `products`. Devuelve una expresión JSX que incluye un componente `Head` con varios metadatos sobre la página, un componente `Navbar` que incluye los accesorios `categoriesFiltered` y `products`, un elemento `main` que contiene un componente `CategoriasCard` y un componente `Pie de página`.

Los datos de `categoriesFiltered` se obtienen mapeando los datos de `allCategories` y extrayendo las propiedades necesarias. Luego, la variable `rawproducts` se construye mapeando los datos de `allProducts` y extrayendo las propiedades necesarias. La variable `products` se inicializa como una copia de `rawproducts`. Luego, el ciclo elimina cualquier nombre de categoría no deseado de la propiedad `categoría` de cada `producto`.

La siguiente sección del código realiza un procesamiento adicional para crear la propiedad `categoriesFiltered`. Primero crea una variable `categoryProductFiltered` iterando sobre los datos `allProducts` y extrayendo todos los nombres de categoría únicos. A continuación, establece `categoryFilterLength` en la longitud más larga de las dos matrices, `categories` o `categoryProductFiltered`. Finalmente, recorre las dos matrices para construir la matriz `categoriesFiltered`, que contiene solo las categorías que tienen productos asociados con ellas.

La función `getStaticProps` devuelve un objeto que contiene el objeto `props` con los accesorios `categoriesFiltered`, `products` y `categories`, así como una propiedad `revalidate` que le dice a Next.js que regenere la página cada 10 segundos. */

import Head from "next/head";
import Navbar from "../components/NavBar/NavBar";
import axios from "axios";
import CategoriasCard from "../components/Categorias/CategoriasCard";
import Footer from "../components/Footer/Footer";

function Categorias({ categoriesFiltered, products, ddecoCategory }) {
  return (
    <>
      <Head>
        <title>Categorias | TLapps</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <Navbar categoriesFiltered={categoriesFiltered} products={products} />
      <main>
        <CategoriasCard
          category={categoriesFiltered}
          ddecoCategory={ddecoCategory}
        />
        <Footer />
      </main>
    </>
  );
}

export default Categorias;

export async function getStaticProps() {
  const categoriesFiltered = [];
  const allCategories = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[Catalogo][$eq]=true&populate=cover,background,thumbnail"
  );
  const allProducts = await axios.get(
    "https://tlappshop.com/apis/api/products?populate=categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[catalogo][$eq]=true&pagination[limit]=800"
  );

  //En esta peticion se obtienen las imagenes del backround de la carta de la categoria ddeco del exhibidor, la imagen de fondo de la seccion home ddeco y el logo de la misma
  const oneDdecoCategory = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[codigo][$eq]=155&populate=cover,background,thumbnail"
  );

  const ddecoCategory = oneDdecoCategory.data.data.map((item) => ({
    name: item.attributes.category,
    cardImg: item.attributes.cover.data.attributes.formats.large.url,
  }));

  const categories = allCategories.data.data.map((item) => ({
    id: item.id,
    category: item.attributes.category,
    img: item.attributes.cover.data?.attributes.formats.thumbnail.url,
    bgImg: item.attributes.cover.data?.attributes.formats.large.url,
    thumbImg: item.attributes.thumbnail.data
      .map((img) => img.attributes.url)
      .toString(),
  }));

  const rawproducts = allProducts.data.data.map((item) => ({
    id: item.id,
    name: item.attributes.description?.replace(/['"]+/g, ""),
    codigo: item.attributes.sku,
    volt: item.attributes.voltaje,
    img:
      item.attributes.thumbnail.data.attributes.formats?.large?.url != undefined
        ? item.attributes.thumbnail.data.attributes.formats?.large?.url
        : "https://tlappshop-imagenes.s3.amazonaws.com/large_Categori_uea_ED_Automatizacio_uen_v2_copy_29dc855558.webp",
    category: item.attributes.categories.data.map(
      (cat) => cat.attributes.category
    ),
  }));

  /* Este código está eliminando el primer elemento de el arreglo `categoría` para cada producto en el arreglo `productos`,
 si coincide con los strings "Tira Led Baja Especi" o "Manguera Baja Especi". Esto se hace usando
un ciclo for para iterar sobre cada producto y una instrucción if para verificar si el primer elemento del
el arreglo `category` coincide con las cadenas especificadas. Si es así, se utiliza el método `shift()` para eliminar
el primer elemento de la arreglo. El operador de propagación se usa para crear una nueva arreglo 'productos' con
los productos modificados.*/

  const products = [...rawproducts];

  for (let i = 0; i < products.length; i++) {
    if (products[i].category[0] == "Tira Led Baja Especi") {
      products[i].category.shift();
    }
    if (products[i].category[0] == "Manguera Baja Especi") {
      products[i].category.shift();
    }
  }

  //Renderizado condicional de categorias en relacion a la existencia del producto

  const categoryProductFiltered = Array.from(
    new Set(
      allProducts.data.data
        .map((item) =>
          item.attributes?.categories?.data.map(
            (cat) => cat.attributes.category
          )
        )
        .flat(1)
    )
  );

  /* Este código compara la longitud de dos arreglos, `categorías` y `categoríaProductoFiltrado`, y
asignando la mayor longitud a la variable `categoryFilterLength`. Entonces, está iterando sobre los
arreglos `categories` y `categoryProductFiltered` usando bucles for anidados, y empujando la coincidencia
categorías a una nuevo arreglo llamado `categoriesFiltered`. El propósito de este código es filtrar sobre
categorías basadas en la existencia de productos en cada categoría, y cree un nuevo arreglo con solo las
categorías que tienen productos, asegurando que el numero de iteraciones siempre sea tomado del arreglo con
 la longitud mayor para que se itere sobre todas las categorias. */

  let categoryFilterLength = 0;

  categoryFilterLength =
    categories.length > categoryProductFiltered.length
      ? (categoryFilterLength = categories.length)
      : (categoryFilterLength = categoryProductFiltered.length);

  for (let i = 0; i < categoryFilterLength; i++) {
    for (let j = 0; j < categoryFilterLength; j++) {
      if (categories[i]?.category == categoryProductFiltered[j])
        categoriesFiltered.push(categories[i]);
    }
  }
  return {
    props: {
      categoriesFiltered,
      products,
      categories,
      ddecoCategory,
    },
    revalidate: 10,
  };
}

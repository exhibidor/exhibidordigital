/**El componente `Producto` muestra los componentes `NavBar`, `ShowOneProduct` y `Footer`. También incluye el componente `Head` de la biblioteca `next/head` que se utiliza para configurar los metadatos de la página, como el título, la descripción y el favicon.

El componente `NavBar` toma como props:  `categorías`, `producto` y `productos` y `categorías filtradas`. El componente `ShowOneProduct` toma como props `producto`, `categorías`, `productos` y `categorías filtradas`.

Las funciones `getStaticPaths()` y `getStaticProps()` también se incluyen en este componente. Estas funciones son funciones específicas de Next.js que nos permiten obtener datos en el momento de la compilación, en lugar de en el momento de la ejecución. `getStaticPaths()` define para qué rutas debe ejecutarse la función `getStaticProps()`. En este caso, buscará todos los productos y usará sus ID para generar el arreglo `paths`. `fallback` se establece en "bloqueo", lo que significa que la página se creará en tiempo de ejecución si la ruta solicitada no se genera previamente.

En `getStaticProps()`, el componente obtiene datos de la API externa a través de la biblioteca Axios. Obtiene información para el ID de producto especificado y la lista completa de productos y categorías. Los datos obtenidos se utilizan para ser establecidas como props:  `product`, `products`, `categories` y `categoriesFiltered` para el componente.

Por último, hay una representación condicional de categorías en función de si el producto existe o no en la categoría. */

import Head from "next/head";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import ShowOneProduct from "../../components/ShowOneProduct/ShowOneProduct";

function Producto({ product, categories, products, categoriesFiltered }) {
  return (
    <>
      <Head>
        <title>Producto | TLapps</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <NavBar
        categories={categories}
        product={product}
        categoriesFiltered={categoriesFiltered}
        products={products}
      />
      <main className="main">
        <ShowOneProduct
          product={product}
          categories={categories}
          products={products}
          categoriesFiltered={categoriesFiltered}
        />
        <Footer />
      </main>
    </>
  );
}

export default Producto;

export async function getStaticPaths() {
  const { data } = await axios.get(
    `https://tlappshop.com/apis/api/products?populate=categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[catalogo][$eq]=true&pagination[limit]=800`
  );

  const productIds = data.data.map((item) => `${item.id}`);
  return {
    paths: productIds.map((product) => ({
      params: { product },
    })),
    fallback: "blocking",
  };
}

export async function getStaticProps(ctx) {
  const categoriesFiltered = [];
  const id = ctx.params.product;

  //oneProduct
  const { data } = await axios.get(
    `https://tlappshop.com/apis/api/products/${id}?populate=categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[catalogo][$eq]=true&pagination[limit]=800`
  );

  const allProducts = await axios.get(
    "https://tlappshop.com/apis/api/products?populate=categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[catalogo][$eq]=true&pagination[limit]=800"
  );

  const allCategories = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[Catalogo][$eq]=true&populate=cover,background,thumbnail"
  );

  const categories = allCategories.data.data.map((item) => ({
    id: item.id,
    category: item.attributes.category,
    img: item.attributes.background.data.map(
      (item) => item.attributes.formats.large.url
    ),
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

  const oneProduct = {
    id: data.data.id,
    name: data.data.attributes.description.replace(/['"]+/g, ""),
    codigo: data.data.attributes.sku,
    volt: data.data.attributes.voltaje,
    img:
      data.data.attributes.thumbnail.data.attributes?.formats?.large?.url !==
      undefined
        ? data.data.attributes.thumbnail.data.attributes?.formats?.large?.url
        : "https://tlappshop-imagenes.s3.amazonaws.com/large_Categori_uea_ED_Automatizacio_uen_v2_copy_29dc855558.webp",
    category: data.data.attributes.categories.data.map((cat) =>
      cat.attributes.category == "Manguera Baja Especi"
        ? (cat.attributes.category = "Mangueras")
        : cat.attributes.category == "Tira Led Baja Especi"
        ? (cat.attributes.category = "Tiras De Led")
        : cat.attributes.category
    ),
    ficha:
      data.data.attributes.ficha.data?.map((cat) => cat.attributes.url) ==
      undefined
        ? null
        : data.data.attributes.ficha.data?.map((cat) => cat.attributes.url),
    instructivo:
    
      data.data.attributes.instructivo.data?.map((cat) => cat.attributes.url) ==
      undefined
        ? null
        : data.data.attributes.instructivo.data?.map(
            (cat) => cat.attributes.url
          ),
    video: data.data.attributes.video == undefined ? null : data.data.attributes.video.includes("www.youtube.com/watch?v=", "")?  data.data.attributes.video.replace("www.youtube.com/watch?v=", "") :  data.data.attributes.video.includes("https://youtu.be/", "") ? data.data.attributes.video.replace("https://youtu.be/", "") :null ,
    galeria: data.data.attributes.galeria.data?.map(
      (gal) => gal.attributes.url
    ),
  };
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
      product: oneProduct,
      categories,
      products,
      categoriesFiltered,
    },
    revalidate: 10,
  };
}

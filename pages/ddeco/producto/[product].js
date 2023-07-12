/**El componente `Producto` muestra los componentes `NavBar`, `ShowOneProduct` y `Footer`. También incluye el componente `Head` de la biblioteca `next/head` que se utiliza para configurar los metadatos de la página, como el título, la descripción y el favicon.

El componente `NavBar` toma como props:  `categorías`, `producto` y `productos` y `categorías filtradas`. El componente `ShowOneProduct` toma como props `producto`, `categorías`, `productos` y `categorías filtradas`.

Las funciones `getStaticPaths()` y `getStaticProps()` también se incluyen en este componente. Estas funciones son funciones específicas de Next.js que nos permiten obtener datos en el momento de la compilación, en lugar de en el momento de la ejecución. `getStaticPaths()` define para qué rutas debe ejecutarse la función `getStaticProps()`. En este caso, buscará todos los productos y usará sus ID para generar el arreglo `paths`. `fallback` se establece en "bloqueo", lo que significa que la página se creará en tiempo de ejecución si la ruta solicitada no se genera previamente.

En `getStaticProps()`, el componente obtiene datos de la API externa a través de la biblioteca Axios. Obtiene información para el ID de producto especificado y la lista completa de productos y categorías. Los datos obtenidos se utilizan para ser establecidas como props:  `product`, `products`, `categories` y `categoriesFiltered` para el componente.

Por último, hay una representación condicional de categorías en función de si el producto existe o no en la categoría. */

import Head from "next/head";
import axios from "axios";
import NavBar from "../../../ddecocomponents/NavBar/NavBar";
import Footer from "../../../ddecocomponents/Footer/Footer";
import ShowOneProduct from "../../../ddecocomponents/ShowOneProduct/ShowOneProduct";

function Producto({
  product,
  categories,
  products,
  categoriesFiltered,
  ddecoCategory,
}) {
  return (
    <>
      <Head>
        <title>Producto | TLapps ddeco</title>
        <meta name="description" content="Inicio de sesion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicontlapps.svg" />
      </Head>
      <NavBar
        categories={categories}
        product={product}
        categoriesFiltered={categoriesFiltered}
        products={products}
        ddecoCategory={ddecoCategory}
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
    "https://tlappshop.com/apis/api/products?populate=sub_category,categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[categories][category][$eq]=Tlapps ddeco&pagination[limit]=800"
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

  const allCategories = await axios.get(
    "https://tlappshop.com/apis/api/sub-categories?filters[catalogo][$eq]=true&filters[category][category][$eq]=Tlapps ddeco&populate=*&pagination[limit]=800"
  );
  const allProducts = await axios.get(
    "https://tlappshop.com/apis/api/products?populate=sub_category,categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[categories][category][$eq]=Tlapps ddeco&pagination[limit]=800"
  );
  const oneProduct = await axios.get(
    `https://tlappshop.com/apis/api/products/${id}?populate=sub_category,categories,thumbnail,ficha,instructivo,accesorios,galeria&filters[categories][category][$eq]=Tlapps ddeco&pagination[limit]=800`
  );

  //En esta peticion se obtienen las imagenes del backround de la carta de la categoria ddeco del exhibidor, la imagen de fondo de la seccion home ddeco y el logo de la misma
  const oneDdecoCategory = await axios.get(
    "https://tlappshop.com/apis/api/categories?filters[codigo][$eq]=155&populate=cover,background,thumbnail"
  );

  const ddecoCategory = oneDdecoCategory.data.data.map((item) => ({
    cardImg: item.attributes.cover.data.attributes.formats.large.url,
    bgImage: item.attributes.background.data.map(
      (item) => item.attributes.formats.large.url
    ),
    logoDdeco: item.attributes.thumbnail.data.map(
      (item) => item.attributes.url
    ),
  }));

  const categories = allCategories.data.data.map((item) => ({
    id: item.id,
    category: item.attributes.subCategory,
    img: item.attributes.cover.data.map((item) => item.attributes.url),
    bgImage:
      item.attributes.background.data?.map(
        (item) => item.attributes.formats.large.url
      ) == null ||
      item.attributes.background.data?.map(
        (item) => item.attributes.formats.large.url
      ) == undefined
        ? [
            "https://exhibidorddeco.vercel.app/_next/image?url=https%3A%2F%2Ftlappshop-imagenes.s3.amazonaws.com%2FNo_image_available_svg_731bcb13d0.png&w=128&q=75",
          ]
        : item.attributes.background.data?.map(
            (item) => item.attributes.formats.large.url
          ),
    thumbImg: item.attributes.thumbnail.data.map((item) => item.attributes.url),
  }));
  const products = allProducts.data.data.map((item) => ({
    id: item.id,
    name: item.attributes.description,
    codigo: item.attributes.sku,
    volt: item.attributes.voltaje,
    img:
      item.attributes.thumbnail.data == null ||
      item.attributes.thumbnail.data == undefined
        ? "https://exhibidorddeco.vercel.app/_next/image?url=https%3A%2F%2Ftlappshop-imagenes.s3.amazonaws.com%2FNo_image_available_svg_731bcb13d0.png&w=128&q=75"
        : item.attributes.thumbnail.data?.attributes.url,
    category: item.attributes.sub_category.data.attributes.subCategory,
  }));

  const product = {
    id: oneProduct.data.data.id,
    name: oneProduct.data.data.attributes.description,
    codigo: oneProduct.data.data.attributes.sku,
    volt: oneProduct.data.data.attributes.voltaje,
    img:
      oneProduct.data.data.attributes.thumbnail.data?.attributes.url == null ||
      oneProduct.data.data.attributes.thumbnail.data?.attributes.url ==
        undefined
        ? "https://exhibidorddeco.vercel.app/_next/image?url=https%3A%2F%2Ftlappshop-imagenes.s3.amazonaws.com%2FNo_image_available_svg_731bcb13d0.png&w=128&q=75"
        : oneProduct.data.data.attributes.thumbnail.data?.attributes.url,
    category:
      oneProduct.data.data.attributes.sub_category.data.attributes.subCategory,
    ficha: oneProduct.data.data.attributes.ficha.data?.map((item) => item.attributes.url) == undefined ? null : oneProduct.data.data.attributes.ficha.data.map((item) => item.attributes.url),
    instructivo: oneProduct.data.data.attributes.instructivo.data?.map((item) => item.attributes.url) == undefined ? null : oneProduct.data.data.attributes.instructivo.data?.map((item) => item.attributes.url),
    galeria: oneProduct.data.data.attributes.galeria.data?.map((item) => item.attributes.url) == undefined ? null : oneProduct.data.data.attributes.galeria.data.map((item) => item.attributes.url),
    video:
      oneProduct.data.data.attributes.video == undefined
        ? null
        : oneProduct.data.data.attributes.video.includes(
            "https://youtu.be/",
            ""
          )
        ? oneProduct.data.data.attributes.video.replace("https://youtu.be/", "")
        : oneProduct.data.data.attributes.video.includes(
            "www.youtube.com/watch?v=",
            ""
          )
        ? oneProduct.data.data.attributes.video.replace(
            "www.youtube.com/watch?v=",
            ""
          )
        : null,
  };
  //'https://youtu.be/RBjAPF9TOCU'

  //Renderizado condicional de categorias en relacion a la existencia del producto

  const categoryProductFiltered = Array.from(
    new Set(
      allProducts.data.data
        .map((item) => item.attributes.sub_category.data.attributes.subCategory)
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
      if (categories[i].category == categoryProductFiltered[j])
        categoriesFiltered.push(categories[i]);
    }
  }
  return {
    props: {
      categoriesFiltered,
      products,
      categories,
      product,
      ddecoCategory,
    },
    revalidate: 10,
  };
}

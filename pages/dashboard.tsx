import type { NextPage } from 'next';
import styles from '../styles/Dashboard.module.scss';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ApiRequests } from '../lib/api-requests';
import { ProductsApiResponse } from './api/ikas/products';
import { useRouter } from 'next/router';
import { TokenHelpers } from '../lib/token-helpers';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { AddProductApiRequest } from './api/ikas/add-product';

const Home: NextPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<AddProductApiRequest>({ name: '', sellPrice: 0 });

  const router = useRouter();

  const load = async () => {
    const newToken = await TokenHelpers.getTokenForIframeApp(router);
    if (newToken) {
      setToken(newToken);
    }
    await loadProducts(1);
  };

  useEffect(() => {
    load();
  }, []);

  const loadProducts = async (page: number) => {
    setLoading(true);
    try {
      if (token) {
        const res = await ApiRequests.ikas.products(
          {
            pagination: {
              page,
              limit: 10,
            },
          },
          token,
        );
        if (res.status == 200 && res.data) {
          const data = res.data as ProductsApiResponse;
          setProducts(data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onProductLineClick = async (productId: string) => {
    AppBridgeHelper.openProductPage(productId);
  };

  const changePage = async (next: boolean) => {
    const page = products?.page || 1;
    await loadProducts(next ? page + 1 : page - 1);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewProduct({
      ...newProduct,
      name: event.target.value,
    });
  };

  const onSellPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    let sellPrice = parseFloat(event.target.value);

    if (isNaN(sellPrice)) sellPrice = 0;
    setNewProduct({
      ...newProduct,
      sellPrice,
    });
  };

  const onDiscountPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    let discountPrice: number | undefined = parseFloat(event.target.value);

    if (isNaN(discountPrice)) discountPrice = undefined;
    setNewProduct({
      ...newProduct,
      discountPrice,
    });
  };

  const onSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (token) {
        const res = await ApiRequests.ikas.addProduct(newProduct, token);
        if (res.status == 200 && res.data) {
          setNewProduct({ name: '', sellPrice: 0 });
          toggleModal();
          await loadProducts(1);
        }
      }
    } finally {
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.title}>Success!</div>
        <div className={styles.header}>
          <span>Products</span>
          <a onClick={toggleModal}>Add Product</a>
        </div>
        {products?.data?.map((o) => (
          <div className={styles.productLine} key={o.id} onClick={() => onProductLineClick(o.id)}>
            {o.name}
          </div>
        ))}
        <div className={styles.pagination}>
          <button onClick={() => changePage(false)} disabled={(products?.page && products?.page <= 1) || loading}>
            Previous
          </button>
          <button onClick={() => changePage(true)} disabled={!products?.hasNext || loading}>
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalContainer}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Add New Product</div>
            <form onSubmit={onSaveProduct}>
              <div className={styles.modalBody}>
                <div className={styles.inputLine}>
                  <div className={styles.label}>Name</div>
                  <input
                    required={true}
                    name={'name'}
                    value={newProduct?.name}
                    onChange={(event) => onNameChange(event)}
                  />
                </div>

                <div style={{ display: 'flex' }}>
                  <div className={styles.inputLine}>
                    <div className={styles.label}>Sell Price</div>
                    <input
                      required={true}
                      name={'sellPrice'}
                      value={newProduct?.sellPrice}
                      onChange={(event) => onSellPriceChange(event)}
                    />
                  </div>

                  <div className={styles.inputLine}>
                    <div className={styles.label}>Discount Price</div>
                    <input
                      name={'discountPrice'}
                      value={newProduct?.discountPrice}
                      onChange={(event) => onDiscountPriceChange(event)}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button className={styles.ghostButton} type={'button'} onClick={toggleModal}>
                    Close
                  </button>
                  <button type={'submit'}>Add</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;

// src/components/Product/Product.js
import React, { useState } from "react";
import { Card } from "antd";
import ProductList from "../components/Product/ProductList";
import ProductForm from "../components/Product/ProductForm";

function Product() {
  const [visible, setVisible] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditProductId(null);
  };

  return (
    <Card title="Product Management" bordered={false}>
      <ProductList
        setEditProductId={setEditProductId}
        showDrawer={showDrawer}
      />
      <ProductForm
        visible={visible}
        onClose={onClose}
        editProductId={editProductId}
      />
    </Card>
  );
}

export default Product;

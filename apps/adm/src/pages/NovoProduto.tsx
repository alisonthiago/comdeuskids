import React from 'react'
import { useNavigate } from 'react-router-dom'
import { productTypes } from '../data/productTypes'

export default function NovoProduto() {
  const navigate = useNavigate()
  return <div className="product-type-page">
    <div className="product-type-header"><button onClick={() => navigate('/admin/produtos')}>← Voltar aos produtos</button><h1>O que você vai vender?</h1><p>Escolha o formato para começar o cadastro do seu produto.</p></div>
    <section className="product-type-grid">{productTypes.map(({ title, text, icon: Icon, type }) => <button key={type} onClick={() => navigate(`/products/bw/add/2/info?tipo=${type}`)} className="product-type-card"><div><Icon size={68} /></div><strong>{title}</strong><span>{text}</span></button>)}</section>
  </div>
}

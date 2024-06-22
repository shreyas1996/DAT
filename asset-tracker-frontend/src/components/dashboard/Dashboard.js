import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [name, setName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [createStatus, setCreateStatus] = useState('');
  const [assetId, setAssetId] = useState('');
  const [email, setEmail] = useState('');
  const [transferStatus, setTransferStatus] = useState('');
  const [search, setSearch] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);

  useEffect(() => {
    fetchUserAssets();
  }, []);

  const fetchUserAssets = async () => {
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const res = await axios.get('http://localhost:3002/api/assets/user', config);
      setAssets(res.data.blockchainAssets);
      setFilteredAssets(res.data.blockchainAssets);
    } catch (err) {
      console.error(err.message);
    }
  };

  const createAsset = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const body = JSON.stringify({ name, metadata });
      const res = await axios.post('http://localhost:3002/api/assets', body, config);
      setCreateStatus('Asset created successfully');
      fetchUserAssets();
    } catch (err) {
      setCreateStatus('Error creating asset');
      console.error(err.message);
    }
  };

  const transferAsset = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const body = JSON.stringify({ email });
      const res = await axios.put(`http://localhost:3002/api/assets/transfer/${assetId}`, body, config);
      setTransferStatus('Asset transferred successfully');
      alert(res.data);
      fetchUserAssets();
    } catch (err) {
      setTransferStatus('Error transferring asset');
      console.error(err.message);
      alert("Error transferring asset");
    }
  };

  const searchAssets = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(assets.filter(asset => asset.name.toLowerCase().includes(e.target.value.toLowerCase())));
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Dashboard</h1>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Create Asset</h5>
        </div>
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Asset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Asset Metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
          <button className="btn btn-primary" onClick={createAsset}>Create</button>
          <p>{createStatus}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Transfer Asset</h5>
        </div>
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Asset ID"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="New Owner Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary" onClick={transferAsset}>Transfer</button>
          <p>{transferStatus}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Search Assets</h5>
        </div>
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search"
            value={search}
            onChange={searchAssets}
          />
          <div className="asset-list">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="asset-item p-2 mb-2">
                <p><strong>ID:</strong> {asset.id}</p>
                <p><strong>Name:</strong> {asset.name}</p>
                <p><strong>Metadata:</strong> {asset.metadata}</p>
                <p><strong>Owner:</strong> {asset.owner}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

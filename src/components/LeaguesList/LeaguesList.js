import { useState, useEffect, useMemo } from 'react';
import { Table, Input, Select } from 'antd';
import SeasonBadgeModal from '../SeasonBadgeModal/SeasonBadgeModal';
import './LeaguesList.css';

function LeaguesList() {
  const [leagues, setLeagues] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [sportType, setSportType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [badgeData, setBadgeData] = useState(null);

  const { Search } = Input;

  // Fetching leagues data from the API
  const fetchLeaguesData = async () => {
    try {
      const url = 'https://www.thesportsdb.com/api/v1/json/3/all_leagues.php';
      const cachedData = localStorage.getItem(url);

      // Check if cached data exists and is fresh
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isFresh = Date.now() - timestamp < 60 * 1000; // 1 minute cache expiration
        if (isFresh) return data;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      localStorage.setItem(url, JSON.stringify({
        data: data.leagues,
        timestamp: Date.now()
      }));
      return data.leagues;
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  // Fetching season badge data from the API
  const fetchSeasonBadgeData = async (leagueId) => {
    try {
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id=${leagueId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      if (data.seasons && data.seasons.length > 0) {
        setBadgeData(data.seasons[0].strBadge); // Assuming you want the first season's badge
      } else {
        setBadgeData(null); // No seasons found
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  // Handle league click event
  const handleLeagueClick = (leagueId) => {
    console.log(`League ID clicked: ${leagueId}`);
    fetchSeasonBadgeData(leagueId);
    handleOpenModal();
  };

  const filteredLeagues = useMemo(() => {
    return leagues?.filter(league => {
      const nameMatch = league.strLeague
        .toLowerCase()
        .includes(searchValue.toLowerCase());

      const sportMatch = sportType === 'All' || 
        league.strSport === sportType;
  
      return nameMatch && sportMatch;
    });
  }, [leagues, searchValue, sportType]);

  const onSearch = (value) => {
    setSearchValue(value);
  }

  const handleChange = (value) => {
    setSportType(value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
 
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchLeaguesData();
      setLeagues(result);
    };
    loadData();
  }, []);

  return (
    <div className="leagues-list">
      <div className="leagues-header">
        <Search
          className="leagues-search"
          placeholder="input league name"
          allowClear
          enterButton="Search"
          onSearch={onSearch}
        />
        <div>
          <span className="label">Sport Type:</span>
          <Select
            defaultValue="All"
            style={{ width: 120 }}
            onChange={handleChange}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Soccer', label: 'Soccer' },
              { value: 'Motorsport', label: 'Motorsport' },
              { value: 'Ice Hockey', label: 'Ice Hockey' },
              { value: 'American Football', label: 'American Football' },
            ]}
          />
        </div>
      </div>
      <Table className="leagues-table"
        dataSource={filteredLeagues}
        columns={[
          {
            title: 'League Name',
            dataIndex: 'strLeague',
            key: 'strLeague',
            width: '35%',
          },
          {
            title: 'Alternate League Name',
            dataIndex: 'strLeagueAlternate',
            key: 'strLeagueAlternate',
            width: '35%',
            render: (text) => text || 'N/A', // Handle empty alternate names
          },
          {
            title: 'Sport Type',
            dataIndex: 'strSport',
            key: 'strSport',
            width: '30%',
          },
        ]}
        rowKey="idLeague"
        onRow={(record) => ({
          onClick: () => handleLeagueClick(record.idLeague)
        })}
        pagination={false}
      />
      <SeasonBadgeModal 
        badgeData={badgeData}
        isOpen={isModalOpen}
        onClose={() => {
          handleCloseModal();
          setBadgeData(null); // Clear badge data when modal is closed
        }}
      />
    </div>
  );
}

export default LeaguesList;

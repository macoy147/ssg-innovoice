import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconHome, IconSearch, IconAlertCircle } from '@tabler/icons-react';
import plugIllustration from '../../assets/404-plug.gif';
import './NotFound.scss';

const NotFound = ({ customTitle, customMessage, isCloakedAdmin = false }) => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        {/* Status Badge */}
        <div className="not-found-badge">
          <span className="badge-dot" />
          <span>404 • PAGE NOT FOUND</span>
        </div>

        {/* Animated Storyset Plug Illustration */}
        <div className="illustration-wrapper">
          <img
            src={plugIllustration}
            alt="404 Error - People connecting a plug illustration by Storyset"
            className="not-found-gif"
          />
        </div>

        {/* Content Section */}
        <div className="not-found-content">
          <h1 className="not-found-title">
            {customTitle || 'Oops! This Connection is Unplugged'}
          </h1>
          <p className="not-found-desc">
            {customMessage ||
              "The page you are trying to reach doesn't exist, has been relocated, or is temporarily unavailable on the InnoVoice portal."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <button
            type="button"
            className="btn-primary-home"
            onClick={() => navigate('/')}
          >
            <IconArrowLeft size={18} />
            <span>Back to Home Portal</span>
          </button>

          <button
            type="button"
            className="btn-secondary-track"
            onClick={() => navigate('/?track=open')}
          >
            <IconSearch size={17} />
            <span>Track a Suggestion</span>
          </button>
        </div>

        {/* Storyset Attribution Credit */}
        <div className="not-found-credits">
          <a
            href="https://storyset.com/web"
            target="_blank"
            rel="noopener noreferrer"
            className="storyset-link"
          >
            Web illustrations by Storyset
          </a>
        </div>
      </div>

      {/* Institutional Footer Tag */}
      <footer className="not-found-footer">
        Supreme Student Government • Cebu Technological University - Daanbantayan Campus
      </footer>
    </div>
  );
};

export default NotFound;

import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../context/GlobalState';

export const handleSlackAuth = async (code, viewer_id, organisation_id, axiosInstance) => {
  try {
    const decodedCode = decodeURIComponent(code);
    const response = await axiosInstance.post('/slack/slack-oauth-callback', {
      code: decodedCode,
      viewer_id,
      organisation_id,
    });

    if (response.status === 200) {
      toast.success("Slack connected successfully!");
    } else {
      toast.error("Failed to connect Slack");
    }
  } catch (error) {
    console.error("Error during Slack authorization:", error);
    toast.error("Error connecting to Slack");
  }
};

const SlackIntegration = () => {
  const {
    viewer_id,
    selectedOrganisationId,
    baseURL,
  } = useContext(GlobalContext);

  const axiosInstance = useAxiosInstance();
  const [isConnected, setIsConnected] = useState(false);
  const [slackTeamName, setSlackTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkSlackConnection = async () => {
      try {
        const response = await axiosInstance.post('slack/check-slack-connection', {
          viewer_id,
          organisation_id: selectedOrganisationId,
        });

        if (response.data?.connected) {
          setIsConnected(true);
          setSlackTeamName(response.data.team_name || "");
        }
      } catch (error) {
        console.error("Error checking Slack connection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSlackConnection();
  }, [viewer_id, selectedOrganisationId]);

  const sendTestMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('slack/send-test-message', {
        viewer_id,
        organisation_id: selectedOrganisationId,
        messageText: "This is a test message from Revspire",
      });

      if (response.data.success) {
        toast.success("Test message sent successfully!");
      } else {
        toast.error("Failed to send test message");
      }
    } catch (error) {
      toast.error("Error sending test message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('slack/disconnect-slack', {
        viewer_id,
        organisation_id: selectedOrganisationId,
      });

      if (response.status === 200) {
        setIsConnected(false);
        setSlackTeamName("");
        toast.success("Successfully disconnected from Slack");
      } else {
        toast.error("Failed to disconnect from Slack");
      }
    } catch (error) {
      toast.error("Error disconnecting from Slack");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUri = `https://redirection.revspire.io/slack-integration`;
  const originURL = encodeURIComponent(`${window.location.href}?organisationId=${selectedOrganisationId}`);
  const stateObject = { originURL };
  const clientId = "6307846219842.7721339634279";
  const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=app_mentions:read,channels:history,chat:write,chat:write.customize,chat:write.public,commands,groups:history,groups:write,im:history,im:write,mpim:history,mpim:write,users:read,users:read.email&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(JSON.stringify(stateObject))}`;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className='pb-10'>
      <div className="shadow-sm flex flex-col justify-center w-[98%] ml-2 mt-3 py-3 px-4 pb-8 rounded-md">
        <h2 className="font-semibold text-lg mb-4">Slack Integration</h2>

        {isConnected ? (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Connected to:</span>
              <span>{slackTeamName}</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={sendTestMessage}
                disabled={isLoading}
                className="bg-[#4A154B] hover:bg-[#3a0d3a] text-white w-[200px] h-[40px] rounded-md mt-3"
              >
                {isLoading ? 'Sending...' : 'Send Test Message'}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white w-[200px] h-[40px] rounded-md mt-3"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Slack'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-gray-600">Connect your Slack workspace to enable notifications and commands.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-4 py-2 rounded-md"
            >
              Connect to Slack
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Connect Slack to Revspire</h3>
            <p className="mb-3 text-gray-600">
              Revspire's Slack integration lets you receive real-time updates, trigger workflows, and collaborate seamlessly.
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-500">
              <li>Get alerts in your Slack channels</li>
              <li>Trigger Revspire workflows via Slack commands</li>
              <li>Collaborate with your team without switching tabs</li>
            </ul>
            <div className="flex justify-center">
              <a href={slackOAuthUrl}>
                <img
                  alt="Add to Slack"
                  height="40"
                  width="139"
                  src="https://platform.slack-edge.com/img/add_to_slack.png"
                  srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
              </a>
            </div>
            <p className="text-sm mt-4 text-center text-gray-500">
              By connecting, you agree to our{' '}
              <a href="https://revspire.io/terms-of-use/" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">Terms</a>{' '}
              and{' '}
              <a href="https://revspire.io/revspire-privacy-policy/" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlackIntegration;
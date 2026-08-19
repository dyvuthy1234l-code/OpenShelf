import OpenShelfLoader from '../common/OpenShelfLoader';

export default function LoadingState({ message = 'Loading library resources...' }) {
  return <OpenShelfLoader message={message} compact />;
}

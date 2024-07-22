import automatedEmails from './automated';
import marketingEmails from './marketing';
import partnershipsEmails from './partnerships';

export default {
  ...automatedEmails,
  ...partnershipsEmails,
  ...marketingEmails,
};

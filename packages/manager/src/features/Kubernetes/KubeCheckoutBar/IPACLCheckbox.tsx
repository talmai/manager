import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import Box from 'src/components/core/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import DisplayPrice from 'src/components/DisplayPrice';
import Link from 'src/components/Link';
import { IP_ACCESS_CONTROL_LIST_PRICE } from 'src/constants';

export const IPACLCopy = () => (
  <Typography>
    An IP Access Control Listed (IP-ACL) cluster is ....
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the IP ACLs
    </Link>
    .
  </Typography>
);

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(),
    fontSize: '16px',
    fontWeight: 600,
  },
  checkbox: {
    marginTop: -8,
    marginLeft: -8,
  },
  price: {
    marginTop: theme.spacing(),
    '& h3': {
      color: `${theme.palette.text.primary} !important`,
      fontFamily: theme.font.normal,
    },
  },
}));

export interface Props {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const IPACLCheckbox: React.FC<Props> = (props) => {
  const { checked, onChange } = props;
  const classes = useStyles();

  if (IP_ACCESS_CONTROL_LIST_PRICE === undefined) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <CheckBox
          checked={checked}
          onChange={onChange}
          className={classes.checkbox}
          data-testid="ha-checkbox"
        />
        <Box>
          <Typography className={classes.heading}>
            Enable IP Access Control List
          </Typography>
          <IPACLCopy />
        </Box>
      </Box>
      <Box className={classes.price}>
        <DisplayPrice
          price={IP_ACCESS_CONTROL_LIST_PRICE}
          fontSize="14px"
          interval="month"
        />
      </Box>
    </Box>
  );
};

export default IPACLCheckbox;

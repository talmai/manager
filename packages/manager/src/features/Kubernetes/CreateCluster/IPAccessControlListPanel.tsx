import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import ErrorState from 'src/components/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { ExtendedType } from 'src/utilities/extendType';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { ExtendedIP, ipFieldPlaceholder } from 'src/utilities/ipUtils';

interface Props {
  types?: ExtendedType[];
  typesLoading?: boolean;
  typesError?: string;
  apiError?: string;
  isOnCreate?: boolean;
  ips: ExtendedIP[];
  setIPs: (ips: ExtendedIP[]) => void;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  ipSelect: {
    marginTop: theme.spacing(2),
  },
}));

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = (
  props
) => {
  return <RenderLoadingOrContent {...props} />;
};

const RenderLoadingOrContent: React.FunctionComponent<CombinedProps> = (
  props
) => {
  const { typesError, typesLoading } = props;

  if (typesError) {
    return <ErrorState errorText={typesError} />;
  }

  if (typesLoading) {
    return <CircleProgress />;
  }

  return <Panel {...props} />;
};

const Panel: React.FunctionComponent<CombinedProps> = (props) => {
  //const { addNodePool, apiError, types, isOnCreate } = props;

  const submitForm = (selectedPlanType: string, nodeCount: number) => {
    /**
     * Add pool and reset form state.
    addNodePool({
      id: Math.random(),
      type: selectedPlanType,
      count: nodeCount,
    });
     */
  };

  // This will be set to `true` once a form field has been touched. This is used to disable the
  // "Submit" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  const classes = useStyles();
  const ipNetmaskTooltipText =
    'If you do not specify a mask, /32 will be assumed for IPv4 addresses and /128 will be assumed for IPv6 addresses.';

  const handleIPChange = React.useCallback(
    (_ips: ExtendedIP[]) => {
      if (!formTouched) {
        setFormTouched(true);
      }
      props.setIPs(_ips);
    },
    [formTouched, props.setIPs]
  );

  return (
    <Grid container direction="column">
      <Grid item>
        <MultipleIPInput
          title="IP / Netmask"
          aria-label="IP / Netmask for Firewall rule"
          className={classes.ipSelect}
          ips={props.ips}
          onChange={handleIPChange}
          onBlur={() => submitForm}
          inputProps={{ autoFocus: true }}
          tooltip={ipNetmaskTooltipText}
          placeholder={ipFieldPlaceholder}
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);

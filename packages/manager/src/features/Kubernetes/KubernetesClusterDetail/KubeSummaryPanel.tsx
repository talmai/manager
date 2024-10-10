import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { StyledActionButton } from 'src/components/Button/StyledActionButton';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Chip } from 'src/components/Chip';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Stack } from 'src/components/Stack';
import { TagCell } from 'src/components/TagCell/TagCell';
import { Typography } from 'src/components/Typography';
import { KubeClusterSpecs } from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import {
  useKubernetesClusterMutation,
  useKubernetesControlPlaneACLQuery,
  useKubernetesDashboardQuery,
  useResetKubeConfigMutation,
} from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { pluralize } from 'src/utilities/pluralize';

import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import { KubeConfigDisplay } from './KubeConfigDisplay';
import { KubeConfigDrawer } from './KubeConfigDrawer';
import { KubeControlPlaneACLDrawer } from './KubeControlPaneACLDrawer';
import {
  StyledActionRowGrid,
  StyledBox,
  StyledLabelBox,
  StyledTagGrid,
} from './KubeSummaryPanel.styles';

import type { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';

interface Props {
  cluster: KubernetesCluster;
}

export const KubeSummaryPanel = React.memo((props: Props) => {
  const { cluster } = props;

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [
    isControlPlaneACLDrawerOpen,
    setControlPlaneACLDrawerOpen,
  ] = React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    cluster.id
  );

  const {
    data: dashboard,
    error: dashboardError,
  } = useKubernetesDashboardQuery(cluster.id);

  const {
    error: resetKubeConfigError,
    isPending: isResettingKubeConfig,
    mutateAsync: resetKubeConfig,
  } = useResetKubeConfigMutation();

  const isClusterReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: cluster.id,
  });

  const {
    data: aclData,
    error: isErrorKubernetesACL,
    // isFetching: isFetchingKubernetesACL,
    isLoading: isLoadingKubernetesACL,
    // refetch: refetchKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(cluster.id);

  const enabledACL = aclData?.acl.enabled ?? false;
  // const revisionIDACL = acl_response ? acl_response.acl['revision-id'] : '';
  const totalIPv4 = aclData?.acl.addresses?.ipv4?.length ?? 0;
  const totalIPv6 = aclData?.acl.addresses?.ipv6?.length ?? 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  const determineIPACLButtonCopy = isErrorKubernetesACL
    ? 'Install IPACL'
    : enabledACL
    ? pluralize('IP Address', 'IP Addresses', totalNumberIPs)
    : 'Enable IPACL';

  const [
    resetKubeConfigDialogOpen,
    setResetKubeConfigDialogOpen,
  ] = React.useState(false);

  const handleResetKubeConfig = () => {
    return resetKubeConfig({ id: cluster.id }).then(() => {
      setResetKubeConfigDialogOpen(false);
      enqueueSnackbar('Successfully reset Kubeconfig', {
        variant: 'success',
      });
    });
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleUpdateTags = (newTags: string[]) => {
    return updateKubernetesCluster({
      tags: newTags,
    });
  };

  const sxSpacing = {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(1),
  };

  const sxMainGridContainer = {
    paddingBottom: theme.spacing(2.5),
    paddingTop: theme.spacing(2),
    position: 'relative',
  };

  return (
    <Stack sx={{ marginBottom: theme.spacing(3) }}>
      <EntityDetail
        body={
          <Grid
            container
            spacing={2}
            sx={{ ...sxSpacing, ...sxMainGridContainer }}
          >
            <KubeClusterSpecs cluster={cluster} />
            <Grid container direction="column" lg={4} xs={12}>
              <KubeConfigDisplay
                clusterId={cluster.id}
                clusterLabel={cluster.label}
                handleOpenDrawer={handleOpenDrawer}
                isResettingKubeConfig={isResettingKubeConfig}
                setResetKubeConfigDialogOpen={setResetKubeConfigDialogOpen}
              />
            </Grid>
            <Grid
              container
              direction="column"
              justifyContent="space-between"
              lg={5}
              xs={12}
            >
              <StyledActionRowGrid>
                {cluster.control_plane.high_availability && (
                  <Chip
                    label="HA CLUSTER"
                    size="small"
                    sx={(theme) => ({ borderColor: theme.color.green })}
                    variant="outlined"
                  />
                )}
              </StyledActionRowGrid>
              <StyledTagGrid>
                <TagCell
                  disabled={isClusterReadOnly}
                  entityLabel={cluster.label}
                  tags={cluster.tags}
                  updateTags={handleUpdateTags}
                  view="inline"
                />
              </StyledTagGrid>
            </Grid>
          </Grid>
        }
        footer={
          <Grid
            sx={{
              [theme.breakpoints.down('lg')]: {
                padding: theme.spacing(1),
              },
            }}
            alignItems="flex-start"
            lg={8}
            xs={12}
          >
            <StyledBox>
              <StyledLabelBox component="span">IPACL: </StyledLabelBox>
              {isLoadingKubernetesACL ? (
                <Box sx={{ paddingLeft: 1 }}>
                  <CircleProgress noPadding size="sm" />
                </Box>
              ) : (
                <StyledLinkButton
                  onClick={() => setControlPlaneACLDrawerOpen(true)}
                >
                  {determineIPACLButtonCopy}
                </StyledLinkButton>
              )}
            </StyledBox>
          </Grid>
        }
        header={
          <EntityHeader>
            <Box
              sx={{
                ...sxSpacing,
                paddingBottom: theme.spacing(),
                paddingTop: theme.spacing(),
              }}
            >
              <Typography variant="h2">Summary</Typography>
            </Box>
            <Box display="flex" justifyContent="end">
              <StyledActionButton
                onClick={() => {
                  window.open(dashboard?.url, '_blank');
                }}
                sx={{
                  '& svg': {
                    height: '14px',
                    marginLeft: '4px',
                  },
                  alignItems: 'center',
                  display: 'flex',
                }}
                disabled={Boolean(dashboardError) || !dashboard}
              >
                Kubernetes Dashboard
                <OpenInNewIcon />
              </StyledActionButton>
              <StyledActionButton
                sx={{
                  [theme.breakpoints.up('md')]: {
                    paddingRight: '8px',
                  },
                }}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Cluster
              </StyledActionButton>
            </Box>
          </EntityHeader>
        }
        noBodyBottomBorder
      />

      <KubeConfigDrawer
        closeDrawer={() => setDrawerOpen(false)}
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        open={drawerOpen}
      />
      <KubeControlPlaneACLDrawer
        closeDrawer={() => setControlPlaneACLDrawerOpen(false)}
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        clusterMigrated={!isErrorKubernetesACL}
        open={isControlPlaneACLDrawerOpen}
      />
      <DeleteKubernetesClusterDialog
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Reset Kubeconfig',
              loading: isResettingKubeConfig,
              onClick: () => handleResetKubeConfig(),
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: () => setResetKubeConfigDialogOpen(false),
            }}
          />
        }
        error={
          resetKubeConfigError && resetKubeConfigError.length > 0
            ? getErrorStringOrDefault(
                resetKubeConfigError,
                'Unable to reset Kubeconfig'
              )
            : undefined
        }
        onClose={() => setResetKubeConfigDialogOpen(false)}
        open={resetKubeConfigDialogOpen}
        title="Reset Cluster Kubeconfig?"
      >
        This will delete and regenerate the cluster&rsquo;s Kubeconfig file. You
        will no longer be able to access this cluster via your previous
        Kubeconfig file. This action cannot be undone.
      </ConfirmationDialog>
    </Stack>
  );
});

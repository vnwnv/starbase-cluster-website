import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/IaC.svg').default,
    description: (
      <>
        Starbase cluster k8s is a project followed IaC pattern, focus on easy deploy RKE2 cluster in
        selfhost environment.
      </>
    ),
  },
  {
    title: 'Build on openSUSE MicroOS',
    Svg: require('@site/static/img/upgrade.svg').default,
    description: (
      <>
        Whole stack is based on openSUSE MicroOS, which has a lot of advantages, such as
        atomic, automatic upgrade, and so on.
      </>
    ),
  },
  {
    title: 'Powered by Terraform and Ansible',
    Svg: require('@site/static/img/tools.svg').default,
    description: (
      <>
        Combine terraform and ansible to build a cluster, Quick deploy and bootstrap.
        And fullly decoupled into two stages.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

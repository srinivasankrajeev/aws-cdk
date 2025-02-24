import { singletonEventRole } from './util';
import * as events from '../../aws-events';
import * as iam from '../../aws-iam';
import * as firehose from '../../aws-kinesisfirehose';

/**
 * Customize the Firehose Stream Event Target
 */
export interface KinesisFirehoseStreamProps {
  /**
   * The message to send to the stream.
   *
   * Must be a valid JSON text passed to the target stream.
   *
   * @default - the entire Event Bridge event
   */
  readonly message?: events.RuleTargetInput;
}


/**
 * Customize the Firehose Stream Event Target
 */
export class KinesisFirehoseStream implements events.IRuleTarget {

  constructor(private readonly stream: firehose.CfnDeliveryStream, private readonly props: KinesisFirehoseStreamProps = {}) {
  }

  /**
   * Returns a RuleTarget that can be used to trigger this Firehose Stream as a
   * result from a Event Bridge event.
   */
  public bind(_rule: events.IRule, _id?: string): events.RuleTargetConfig {
    const role = singletonEventRole(this.stream);
    role.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['firehose:PutRecord', 'firehose:PutRecordBatch'],
      resources: [this.stream.attrArn],
    }));


    return {
      arn: this.stream.attrArn,
      role,
      input: this.props.message,
      targetResource: this.stream,
    };
  }
}
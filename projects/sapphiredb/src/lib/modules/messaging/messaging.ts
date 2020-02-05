import {Observable} from 'rxjs';
import {SubscribeMessageCommand} from '../../command/subscribe-message/subscribe-message-command';
import {finalize, map} from 'rxjs/operators';
import {TopicResponse} from '../../command/subscribe-message/topic-response';
import {UnsubscribeMessageCommand} from '../../command/unsubscribe-message/unsubscribe-message-command';
import {PublishCommand} from '../../command/publish/publish-command';
import {MessageResponse} from '../../command/message/message-response';
import {MessageCommand} from '../../command/message/message-command';
import {ConnectionManager} from '../../connection/connection-manager';

export class Messaging {
  constructor(private connectionManagerService: ConnectionManager) {

  }

  /**
   * Get all messages for the client
   */
  public messages(): Observable<any> {
    return this.connectionManagerService.registerServerMessageHandler().pipe(map((response: MessageResponse) => {
      return response.data;
    }));
  }

  /**
   * Subscribe to a topic on the server
   * @param topic The topic to subscribe
   */
  public topic(topic: string): Observable<any> {
    const subscribeCommand = new SubscribeMessageCommand(topic);
    return this.connectionManagerService.sendCommand(subscribeCommand, true).pipe(
      map((response: TopicResponse) => {
        return response.message;
      }),
      finalize(() => {
        this.connectionManagerService.sendCommand(new UnsubscribeMessageCommand(topic, subscribeCommand.referenceId), false, true);
      })
    );
  }

  /**
   * Send data to other clients
   * @param data The data to send
   * @param filter A client-filter to apply when sending message
   * @param filterParameters Data to use in the filter
   */
  public send(data: any, filter?: string, filterParameters?: any[]): void {
    this.connectionManagerService.sendCommand(new MessageCommand(data, filter, filterParameters), false, true);
  }

  /**
   * Publish data to a topic
   * @param topic The topic for publishing
   * @param data The data to publish
   */
  public publish(topic: string, data: any): void {
    this.connectionManagerService.sendCommand(new PublishCommand(topic, data), false, true);
  }
}

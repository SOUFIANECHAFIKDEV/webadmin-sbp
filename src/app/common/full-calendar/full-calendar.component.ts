import { Component, Input, Output, EventEmitter } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-full-calendar',
  templateUrl: './full-calendar.component.html',
  styleUrls: ['./full-calendar.component.scss']
})
export class FullCalendarComponent {
  title = 'appClaendar';
  calendarPlugins = [dayGridPlugin, listPlugin, interactionPlugin]; // important!
  locales = [frLocale];
  locale = 'fr'
  header = {
    left: 'today',
    center: 'prevYear prev title next nextYear ',
    right: 'listWeek,dayGridMonth,dayGridWeek'
  };

  defaultView: 'dayGridMonth,dayGridWeek,listWeek'

  @Input('calendarEvents') calendarEvents = [];
  @Output('navigateToClick') navigateToClick = new EventEmitter();
  eventClick(eventClick) {
    const innerHTML = eventClick.el.innerHTML;
    const innerHTML2 = innerHTML.substring(innerHTML.indexOf('Réference : '), innerHTML.length);
    const innerHTML3 = innerHTML2.substring(0, innerHTML2.indexOf('<br>'))
    const deuxPointindex = innerHTML3.indexOf(': ');
    const result = innerHTML3.substring(deuxPointindex + 2, innerHTML3.length - 4);
    this.navigateToClick.emit(result);
  }
  /*
    s-s--ons-ez-ent
    attendre
    descendre
    entendre
    predre
    répondre
  */
}
